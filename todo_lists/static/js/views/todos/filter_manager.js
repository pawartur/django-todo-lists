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
    'views/todos/not_done_filter',
    'views/todos/context_filter',
    'views/todos/tag_filter',
    'views/todos/priority_filter',
    'text!templates/todos/filter_manager.html'
], function(
        $,
        _,
        Backbone,
        toDoNotDoneFilterView,
        toDoContextFilterView,
        toDoTagFilterView,
        toDoPriorityFilterView,
        toDoListActionFilterTemplate
    ){
    var toDoFilterManagerView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(
                this,
                'destroy',
                'render',
                'unrender',
                'bind_events',
                'unbind_events',
                'reset_all'
            );
            this.bind_events();
            this.subviews = {};
        },
        destroy: function(){
            this.unbind_events();
            this.unrender();
        },
        bind_events: function(){
        
        },
        unbind_events: function(){
            
        },
        unrender: function(){
            _.each(this.subviews, function(cid, subview){
                subview.unrender();
            });
            this.subviews = {};
            this.$el.empty();
        },
        render: function(){
            var compiledTemplate = _.template(toDoListActionFilterTemplate, {});
            this.$el.html(compiledTemplate);

            var not_done_filter = new toDoNotDoneFilterView({
                el: this.$('.not-done-filter'),
                filtered_collection: this.collection,
            })

            var context_filter = new toDoContextFilterView({
                el: this.$('.context-filter'),
                filtered_collection: this.collection,
                collection: this.options.todo_context_collection
            });

            var tag_filter = new toDoTagFilterView({
                el: this.$('.tag-filter'),
                filtered_collection: this.collection,
                collection: this.options.todo_tag_collection
            });
            var priority_filter = new toDoPriorityFilterView({
                el: this.$('.priority-filter'),
                filtered_collection: this.collection
            });

            this.subviews[not_done_filter.cid] = not_done_filter;
            this.subviews[context_filter.cid] = context_filter;
            this.subviews[tag_filter.cid] = tag_filter;
            this.subviews[priority_filter.cid] = priority_filter;

            _.each(this.subviews, function(subview, key){
                subview.render();
            });

            return this;
        },
        reset_all: function(model){
            var needs_reset = false;
            _.each(this.subviews, function(subview, key){
                needs_reset = needs_reset || subview.reset_filter();
            });
            if (needs_reset) {
                this.collection.reset();
            }
        }
    });
    return toDoFilterManagerView;
});
