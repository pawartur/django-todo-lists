/* =========================================================
 * django-todo-lists
 * http://www.github.com/pawartur/django-todo-lists
 * =========================================================
 * Copyright (c) 2012, Artur Wdowiarski
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this 
 * list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, 
 * this list of conditions and the following disclaimer in the documentation 
 * and/or other materials provided with the distribution.
 * The names of its contributors may not be used to endorse or promote products 
 * derived from this software without specific prior written permission.

 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR 
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON 
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS 
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ========================================================= */

define([
    'jQuery',
    'Underscore',
    'Backbone',
    'models/todo_tag',
    'views/todos/list_item',
    'views/todos/details',
    'text!templates/todos/list.html'
], function($, _, Backbone, toDoTag, toDoListItemView, toDoDetailsView, toDoListTemplate){
    var toDoListView = Backbone.ListView.extend({
        template: toDoListTemplate,
        item_view: toDoListItemView,
        item_details_view: toDoDetailsView,
        subview_elem_template : "<div class='todo-item row-fluid'></div>",
        item_details_elem_template: "<div class='row-fluid todo-details'></div>",
        initialize: function(){
            _.bindAll(
                this,
                'process_new_todo_tags_from_model'
            );
            Backbone.ListView.prototype.initialize.apply(this, arguments);
        },
        bind_events: function(){
            Backbone.ListView.prototype.bind_events.call(this, arguments);
            this.collection.on("filters_set", this.hide_item_details);
            this.collection.on("manual_add", this.process_new_todo_tags_from_model);
        },
        unbind_events: function(){
            Backbone.ListView.prototype.unbind_events.call(this, arguments);
            this.collection.off("filters_set", this.hide_item_details);
            this.collection.off("manual_add", this.process_new_todo_tags_from_model);
        },
        render: function(){
            Backbone.ListView.prototype.render.apply(this, arguments);
            this.collection.fetch({"add": true});
        },
        insert_subview: function(subview){
            var todo = subview.model;
            var el = subview.$el;
            if (todo.collection.indexOf(todo) == 0) {
                this.$el.prepend(el);
            }else{
                this.$('.todo-item:last').after(el);
            }
        },
        get_item_details_options: function(item){
            var options = Backbone.ListView.prototype.get_item_details_options.apply(this, arguments);
            options.todo_list_collection = this.options.todo_list_collection;
            options.todo_context_collection = this.options.todo_context_collection;
            options.todo_tag_collection = this.options.todo_tag_collection;
            return options;
        },
        insert_item_details_view: function(item_details_view){
            this.$(".active-subview").after(item_details_view.$el);
        },
        process_new_todo_tags_from_model: function(model){
            var self = this;
            _.each(model.get("tags"), function(tag, index){
                if (!self.options.todo_tag_collection.get(tag.id)) {
                    var model = new toDoTag(tag);
                    self.options.todo_tag_collection.add(model);
                }
            });
        },
        model_changed: function(model){
            var self = this;
            Backbone.ListView.prototype.model_changed.apply(self, arguments);

            if ("tags" in model.changed) {
                self.process_new_todo_tags_from_model(model);
            }
            
            if ("is_done" in model.changed && "not_done" in self.collection.filters) {
                var is_done = model.get("is_done");
                if (is_done == self.collection.filters["not_done"]) {
                    var subview = self.subviews[model.get("id")];
                    self.remove_subview(subview);
                    if (this.item_details && this.item_details.model.get("id") == model.get("id")) {
                        this.hide_item_details();
                    }
                }
            }
        }
    });
    return toDoListView;
});
