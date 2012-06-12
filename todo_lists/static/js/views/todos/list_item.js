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
    'models/todo',
    'text!templates/todos/list_item.html'
], function($, _, Backbone, toDoModel, toDoListItemTemplate){
    var toDoListItemView = Backbone.ListItemView.extend({
        template: toDoListItemTemplate,
        item_model: toDoModel,
        events: _.extend({
            "click a[data-action='mark_done']": "toggle_done",
            "click a[data-action='mark_undone']": "toggle_done"
        }, Backbone.ListItemView.prototype.events),
        initialize: function(){
            _.bindAll(
                this,
                'toggle_done'
            );
            Backbone.ListItemView.prototype.initialize.call(this);
        },
        toggle_done: function(evt){
            evt.preventDefault();
            var is_done = this.model.get("completion_time") ? "False" : "True";
            this.model.save({is_done: is_done}, {wait: true});
        },
        render: function(options){
            Backbone.ListItemView.prototype.render.apply(this, arguments);
            this.$el.removeClass(function() {
                return $(this).attr("class").split(" ").filter(function(el, index){ return el.indexOf("priority") == 0 }).join(" ");
            });
            var priority = this.model.get("priority");
            this.$el.addClass('priority-' + priority[1].toLowerCase());
        },
    });
    return toDoListItemView;
});
