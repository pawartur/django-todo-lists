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
    'models/todo_list',
    'collections/todo_list_collection',
    'models/todo_context',
    'collections/todo_context_collection',
    'models/todo_tag',
    'collections/todo_tag_collection',
    'collections/todo_collection',
    'views/todo_lists/filter',
    'views/todos/list',
    'views/todos/list_actions'
], function($,
            _,
            Backbone,
            toDoListModel,
            toDoListCollection,
            toDoContextModel,
            toDoContextCollection,
            toDoTagModel,
            toDoTagCollection,
            toDoCollection,
            toDoListFilterView,
            toDoListView,
            toDoListActionsView
            ){
    var markItDoneManagerView = Backbone.View.extend({
        el: $("#content"),
        initialize: function(){
            _.bindAll(
                this,
                'destroy',
                'initialize_todo_collection',
                'initialize_todo_list_collection',
                'initialize_todo_context_collection',
                'initialize_todo_tag_collection',
                'initialize_todo_list_filter_view',
                'initialize_todo_list_actions_view',
                'initialize_todo_list_view',
                'bind_events',
                'unbind_events',
                'render',
                'unrender'
            );

            this.initialize_todo_list_collection();
            this.initialize_todo_context_collection();
            this.initialize_todo_tag_collection();
            this.initialize_todo_collection();

            this.initialize_todo_list_filter_view();
            this.initialize_todo_list_actions_view();
            this.initialize_todo_list_view();

            this.bind_events();
        },
        initialize_todo_list_collection: function(){
            var todo_lists = [];
            _.each(bootstrapped_todo_lists, function(todo_list_data){
                todo_lists.push(new toDoListModel(todo_list_data));
            });
            delete bootstrapped_todo_lists;

            this.todo_list_collection = new toDoListCollection(todo_lists);
        },
        initialize_todo_context_collection: function(){
            var todo_contexts = [];
            _.each(bootstrapped_todo_contexts, function(todo_context_data){
                todo_contexts.push(new toDoContextModel(todo_context_data));
            });
            delete bootstrapped_todo_contexts;

            this.todo_context_collection = new toDoContextCollection(todo_contexts);
        },
        initialize_todo_tag_collection: function(){
            var todo_tags = [];
            _.each(bootstrapped_todo_tags, function(todo_tag_data){
                todo_tags.push(new toDoTagModel(todo_tag_data));
            });
            delete bootstrapped_todo_tags;

            this.todo_tag_collection = new toDoTagCollection(todo_tags);           
        },
        initialize_todo_collection: function(){
            this.todo_collection = new toDoCollection([], {
                todo_list_collection: this.todo_list_collection,
                todo_context_collection: this.todo_context_collection
            });
            var initial_filters = localStorage.getItem(this.todo_collection.name+"Filters");
            if (initial_filters){
                this.todo_collection.filters = JSON.parse(initial_filters);
            }
        },
        initialize_todo_list_filter_view: function(){
            var todo_list_filter_el = this.$("#sidebar");
            if (!todo_list_filter_el.length) {
                // TODO: Log error
                return;
            };

            this.todo_list_filter = new toDoListFilterView({
                el: todo_list_filter_el,
                collection: this.todo_list_collection,
                filtered_collection: this.todo_collection
            });
        },
        initialize_todo_list_actions_view: function(){
            var todo_list_actions_el = this.$("#todo_list_actions");
            if (!todo_list_actions_el.length) {
                // TODO: Log error
                return;
            };
            this.todo_list_actions = new toDoListActionsView({
                el: todo_list_actions_el,
                collection: this.todo_collection,
                todo_list_collection: this.todo_list_collection,
                todo_context_collection: this.todo_context_collection,
                todo_tag_collection: this.todo_tag_collection
            });
        },
        initialize_todo_list_view: function(){
            var todo_list_el = this.$("#todo_list");
            if (!todo_list_el.length) {
                // TODO: Log error
                return;
            };

            this.todo_list = new toDoListView({
                el: todo_list_el,
                collection: this.todo_collection,
                todo_list_collection: this.todo_list_collection,
                todo_context_collection: this.todo_context_collection,
                todo_tag_collection: this.todo_tag_collection
            });
        },
        destroy: function(){
            this.unbind_events();
            this.todo_list.destroy();
            this.todo_list_filter.destroy();
            this.todo_list_actions.destroy();
        },
        bind_events: function(){

        },
        unbind_events: function(){

        },
        render: function(){
            this.todo_list_filter.render();
            this.todo_list_actions.render();
            this.todo_list.render();
            return this;
        },
        unrender: function(){
            this.todo_list.unrender();
            this.todo_list_filter.unrender();
            this.todo_list_actions.unrender();
        }
    });
    return markItDoneManagerView;
});
