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
    'views/filter_item',
    'views/todo_lists/manager_modal_handler',
    'text!templates/todo_lists/filter.html'
], function($, _, Backbone, filterItemView, toDoListManagerModalHandlerView, toDoListListTemplate){
    var toDoListFilterView = Backbone.FilterView.extend({
        item_view: filterItemView,
        template: toDoListListTemplate,
        filter_by: 'todo_list',
        render: function(){
            Backbone.FilterView.prototype.render.apply(this, arguments);  

            var manager_options = {
                el: this.$(".todo-list-manager-placeholder"),
                collection: this.collection
            }
            this.todo_lists_manager_view = new toDoListManagerModalHandlerView(manager_options);
            this.todo_lists_manager_view.render();
            return this;
        },
        insert_subview: function(subview){
            var $after = this.$("li.list-item").length ? this.$("li.list-item:last") : this.$(".lists-header");
            $after.after(subview.$el);
        },
        mark_chosen_filter: function(filter_value){
            this.$(".active").removeClass("active");
            if (!filter_value) {
                this.$('*[data-action="reset_filter"]').closest("li").addClass("active");
            }else{
                this.$('[data-value="'+filter_value+'"]').closest("li").addClass("active");
            }
        }
    });
    return toDoListFilterView;
});
