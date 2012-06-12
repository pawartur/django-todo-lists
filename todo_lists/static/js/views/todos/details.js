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
    'collections/todo_alert_collection',
    'views/todo_alerts/manager',
    'text!templates/todos/details.html',
    'text!templates/todos/details_editing.html'
], function($, _, Backbone, toDoAlertCollection, toDoAlertManagerView, toDoDetailsTemplate, toDoDetailsEditingTemplate){
    var toDoDetailsView = Backbone.DetailsView.extend({
        template: toDoDetailsTemplate,
        editing_template: toDoDetailsEditingTemplate,
        initialize: function(){
            _.bindAll(
                this,
                'bind_todo_alert_collection',
                'unbind_todo_alert_collection',
                'get_todo_alerts_manager_options',
                'get_todo_alerts_manager',
                'alert_added',
                'alert_destroyed'
            );
            Backbone.DetailsView.prototype.initialize.apply(this, arguments);
        },
        bind_todo_alert_collection: function(){
            this.todo_alert_manager.collection.on("add", this.alert_added);
            this.todo_alert_manager.collection.on("destroy", this.alert_destroyed);
        },
        unbind_todo_alert_collection: function(){
            this.todo_alert_manager.collection.off("add", this.alert_added);
            this.todo_alert_manager.collection.off("destroy", this.alert_destroyed);
        },
        unrender: function(){
            this.unbind_todo_alert_collection();
            this.todo_alert_manager.unrender();
            Backbone.DetailsView.prototype.unrender.apply(this, arguments);
        },
        get_todo_alerts_manager_options: function(){
            var todo_alerts_collection = new toDoAlertCollection([], {
                parent_todo: this.model
            });
            var fake_response = {"object_list": this.model.get("todo_alerts")};
            var submodels = todo_alerts_collection.parse(fake_response);
            todo_alerts_collection.reset(submodels);
            return {
                collection: todo_alerts_collection,
                el: this.$(".manage-todo-alerts")
            };
        },
        get_todo_alerts_manager: function(){
            var options = this.get_todo_alerts_manager_options();
            return new toDoAlertManagerView(options); 
        },
        render: function(options){
            Backbone.DetailsView.prototype.render.apply(this, arguments);

            this.$form = this.$("#change-todo-form");
            this.$form.find("#id_due_time_date").datepicker({format: 'yyyy-mm-dd'});
            this.$form.find("#id_due_time_time").timepicker({minuteStep: 1, showMeridian: false});

            this.$el.removeClass(function() {
                return $(this).attr("class").split(" ").filter(function(el, index){ return el.indexOf("priority") == 0 }).join(" ");
            });
            var priority = this.model.get("priority");
            this.$el.addClass('priority-' + priority[1].toLowerCase());

            this.todo_alert_manager = this.get_todo_alerts_manager();
            this.bind_todo_alert_collection();
            this.todo_alert_manager.render({is_editing: true});
        },
        get_template_context: function(){
            var context = Backbone.DetailsView.prototype.get_template_context.apply(this, arguments);
            return $.extend({}, context, {
                todo_lists: this.options.todo_list_collection,
                todo_contexts: this.options.todo_context_collection,
                filters: this.model.collection.filters
            });
        },
        preprocess_data: function(data){
            data = Backbone.DetailsView.prototype.preprocess_data.apply(this, arguments);

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
            delete data.predefined_todo_tag;
            if ($predefined_tag_input.length) {
                data.tags += "," + $predefined_tag_input.val();    
            }
            
            return data;
        },
        alert_added: function(todo_alert){
            var alerts = this.model.get("todo_alerts");
            alerts.push({
                id: todo_alert.get("id"),
                time: todo_alert.get("time"),
                todo_id: todo_alert.get("todo_id")
            });
            this.model.set("todo_alerts", alerts);
        },
        alert_destroyed: function(todo_alert){
            var alerts = this.model.get("todo_alerts").filter(function(alert){
                if (alert.id == todo_alert.get("id")) {
                    return false;
                }
                return true;
            });
            this.model.set("todo_alerts", alerts);
        }
    });
    return toDoDetailsView;
});
