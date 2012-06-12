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
    'models/todo'
], function($, _, Backbone, toDoModel){
    var toDoCollection = Backbone.ExtendedCollection.extend({
        name: "toDoCollection",
        model: toDoModel,
        url: '/todos/',
        initialize: function(models, options){
            _.bindAll(
                this,
                'bind_todo_list_collection',
                'bind_todo_context_collection'
            );
            Backbone.ExtendedCollection.prototype.initialize.apply(this, arguments);
            this.bind_todo_list_collection(options.todo_list_collection);
            this.bind_todo_context_collection(options.todo_context_collection);
        },
        bind_todo_list_collection: function(todo_list_collection){
            var self = this;

            var get_relevant = function(todo_list){
                var todo_list_repr = {
                    id: todo_list.get("id")
                }
                var lookup = {todo_list: todo_list_repr}
                return self.where(lookup);
            }

            todo_list_collection.on("destroy", function(model){
                var to_remove = get_relevant(model);
                self.remove(to_remove);
            });

            todo_list_collection.on("change", function(model){
                var to_change = get_relevant(model);
                _.each(to_change, function(todo, index){
                    todo.set("todo_list", {id: model.get("id"), name: model.get("name")});
                });
            });

        },
        bind_todo_context_collection: function(todo_context_collection){
            var self = this;

            var get_relevant = function(todo_context){
                var todo_context_repr = {
                    id: todo_context.get("id")
                }
                var lookup = {todo_context: todo_context_repr}
                return self.where(lookup);
            }

            todo_context_collection.on("destroy", function(model){
                var to_change = get_relevant(model);
                _.each(to_change, function(todo, index){
                    todo.unset("todo_context");
                });
            });

            todo_context_collection.on("change", function(model){
                var to_change = get_relevant(model);
                _.each(to_change, function(todo, index){
                    todo.set("todo_context", {id: model.get("id"), name: model.get("name")});
                });
            });
        },
        apply_filters: function(filters){
            Backbone.ExtendedCollection.prototype.apply_filters.apply(this, arguments);
            localStorage.setItem(this.name+"Filters", JSON.stringify(this.filters));
        }
    });
    return toDoCollection;
});
