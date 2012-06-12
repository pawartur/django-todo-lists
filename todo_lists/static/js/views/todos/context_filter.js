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
    'views/todo_contexts/manager_modal_handler',
    'text!templates/todos/context_filter.html'
], function($, _, Backbone, filterItemView, toDoContextManagerModalHandlerView, toDoContextFilterTemplate){
    var toDoContextFilterView = Backbone.FilterView.extend({
        item_view: filterItemView,
        template: toDoContextFilterTemplate,
        filter_by: 'todo_context',
        render: function(){
            Backbone.FilterView.prototype.render.call(this);

            var manager_options = {
                el: this.$(".todo-context-manager-placeholder"),
                collection: this.collection
            }
            this.todo_contexts_manager_view = new toDoContextManagerModalHandlerView(manager_options);
            this.todo_contexts_manager_view.render();
            return this;
        }
    });
    return toDoContextFilterView;
});
