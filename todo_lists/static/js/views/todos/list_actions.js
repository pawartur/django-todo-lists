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
    'views/todos/add',
    'views/todos/filter_manager',
    'text!templates/todos/list_actions.html'
], function($, _, Backbone, toDoAddView, toDoFilterManagerView, toDoListActionsTemplate){
    var toDoListActionsView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this, 'destroy', 'render', 'unrender', 'bind_events', 'unbind_events');
            this.bind_events();
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
            this.$el.empty();
        },
        render: function(){
            var compiledTemplate = _.template(toDoListActionsTemplate, {});
            this.$el.html(compiledTemplate);

            this.action_add_el = this.$("#add_todo");
            if (!this.action_add_el.length) {
                // TODO: Log error
                return;
            }

            this.action_add = new toDoAddView({
                el: this.action_add_el,
                collection: this.collection,
                todo_list_collection: this.options.todo_list_collection,
                todo_context_collection: this.options.todo_context_collection,
                todo_tag_collection: this.options.todo_tag_collection
            });

            this.action_add.render();

            this.action_filter_el = this.$("#filter_todos");
            if (!this.action_filter_el.length) {
                // TODO: Log error
                return;
            }
            this.action_filter = new toDoFilterManagerView({
                el: this.action_filter_el,
                collection: this.collection,
                todo_context_collection: this.options.todo_context_collection,
                todo_tag_collection: this.options.todo_tag_collection
            });

            this.action_filter.render();
        }
    });
    return toDoListActionsView;
});
