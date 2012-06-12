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
    'text!templates/todos/add.html'
], function($, _, Backbone, toDoModel, toDoAddTemplate){
    var toDoListActionAddView = Backbone.AddView.extend({
        model: toDoModel,
        template: toDoAddTemplate,
        bind_events: function(){
            Backbone.AddView.prototype.bind_events.apply(this, arguments);
            this.options.todo_list_collection.on('change', this.render);
            this.options.todo_context_collection.on('change', this.render);
            this.options.todo_list_collection.on('add', this.render);
            this.options.todo_context_collection.on('add', this.render);
            this.options.todo_list_collection.on('destroy', this.render);
            this.options.todo_context_collection.on('destroy', this.render);
        },
        unbind_events: function(){
            Backbone.AddView.prototype.unbind_events.apply(this, arguments);
            this.options.todo_list_collection.off('change', this.render);
            this.options.todo_context_collection.off('change', this.render);
            this.options.todo_list_collection.off('add', this.render);
            this.options.todo_context_collection.off('add', this.render);
            this.options.todo_list_collection.off('destroy', this.render);
            this.options.todo_context_collection.off('destroy', this.render);
        },
        get_template_context: function(){
            return {
                todo_lists: this.options.todo_list_collection,
                todo_contexts: this.options.todo_context_collection,
                todo_tags: this.options.todo_tag_collection,
                filters: this.collection.filters
            }
        },
        render: function(){
            Backbone.AddView.prototype.render.apply(this, arguments);
            this.$("#id_due_time_date").datepicker({format: 'yyyy-mm-dd'});
            this.$("#id_due_time_time").timepicker({minuteStep: 1, showMeridian: false});
            return this;
        },
        preprocess_data: function(data){
            var due_time_date = data.due_time_date;
            var due_time_time = data.due_time_time;
            delete data.due_time_date;
            delete data.due_time_time;

            var time_am_pm = due_time_time.split(" ");
            var am_pm = time_am_pm[1];
            var time = time_am_pm[0].split(":");

            due_time_time = am_pm == "PM" ? parseInt(time[0]) + 12 + ":" + time[1] : time_am_pm[0];

            if (due_time_date && due_time_time) {
                data.due_time = due_time_date + " " + due_time_time;
            }

            var $predefined_tag_input = this.$('*[name="predefined_todo_tag"]');
            if ($predefined_tag_input.length) {
                delete data.predefined_todo_tag;
                data.tags += "," + $predefined_tag_input.val();    
            }

            return data;
        }
    });
    return toDoListActionAddView;
});
