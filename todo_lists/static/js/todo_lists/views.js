/* =========================================================
 * django-todo-lists
 * http://www.github.com/pawartur/django-todo-lists
 * =========================================================
 * Copyright (c) 21012, Artur Wdowiarski
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

(function(Backbone, ToDoLists){
    filterItemView = Backbone.FilterItemView.extend({
        template: ToDoLists.templates.filterItemViewTemplate
    });

    var toDoAddView = Backbone.AddView.extend({
        model: ToDoLists.models.toDoModel,
        template: ToDoLists.templates.toDoAddTemplate,
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

    var toDoContextFilterView = Backbone.FilterView.extend({
        item_view: filterItemView,
        template: ToDoLists.templates.toDoContextFilterTemplate,
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

    var toDoNotDoneFilterView = Backbone.FilterView.extend({
        item_view: filterItemView,
        template: ToDoLists.templates.toDoNotDoneFilterTemplate,
        filter_by: 'not_done',
        get_items: function(){
            return [
                {id: "True", name: 'To do'},
                {id: "False", name: 'Done'}
            ];
        }
    });

    var toDoPriorityFilterView = Backbone.FilterView.extend({
        item_view: filterItemView,
        template: ToDoLists.templates.toDoPriorityFilterTemplate,
        filter_by: 'priority',
        get_items: function(){
            return [
                {id: 1, name: 'Low Priority'},
                {id: 2, name: 'Medium Priority'},
                {id: 3, name: 'High Priority'}
            ];
        }
    });

    var toDoTagFilterView = Backbone.FilterView.extend({
        item_view: filterItemView,
        template: ToDoLists.templates.toDoTagFilterTemplate,
        filter_by: 'tags'
    });

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
            var compiledTemplate = _.template(ToDoLists.templates.toDoListActionFilterTemplate, {});
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
            var compiledTemplate = _.template(ToDoLists.templates.toDoListActionsTemplate, {});
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

    var toDoDetailsView = Backbone.DetailsView.extend({
        template: ToDoLists.templates.toDoDetailsTemplate,
        editing_template: ToDoLists.templates.toDoDetailsEditingTemplate,
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

    var toDoListItemView = Backbone.ListItemView.extend({
        template: ToDoLists.templates.toDoListItemTemplate,
        item_model: ToDoLists.models.toDoModel,
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

    var toDoListView = Backbone.ListView.extend({
        template: ToDoLists.templates.toDoListTemplate,
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
                    var model = new ToDoLists.models.toDoTagModel(tag);
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

    var toDoListListItemView = Backbone.ListItemView.extend({
        editing_template: ToDoLists.templates.toDoListListItemEditingTemplate,
        item_model: ToDoLists.models.toDoListModel
    });

    var toDoListFilterView = Backbone.FilterView.extend({
        item_view: filterItemView,
        template: ToDoLists.templates.toDoListFilterTemplate,
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

    var toDoListManagerModalView = Backbone.ManagerModalView.extend({
        item_view: toDoListListItemView,
        template: ToDoLists.templates.toDoListManagerModalTemplate
    });

    var toDoListManagerModalHandlerView = Backbone.ManagerModalHandlerView.extend({
        template: ToDoLists.templates.toDoListManagerModalHandlerTemplate,
        modal: toDoListManagerModalView,
        modal_placeholder: $('<div id="todo-lists-manager-modal-placeholder"></div>')
    });

    var toDoContextListItemView = Backbone.ListItemView.extend({
        template: ToDoLists.templates.toDoContextListItemTemplate,
        editing_template: ToDoLists.templates.toDoContextListItemEditingTemplate,
        item_model: ToDoLists.models.toDoContextModel
    });

    var toDoContextManagerModalView = Backbone.ManagerModalView.extend({
        item_view: toDoContextListItemView,
        template: ToDoLists.templates.toDoContextManagerModalTemplate
    });

    var toDoContextManagerModalHandlerView = Backbone.ManagerModalHandlerView.extend({
        template: ToDoLists.templates.toDoContextManagerModalHandlerTemplate,
        modal: toDoContextManagerModalView,
        modal_placeholder: $('<div id="todo-contexts-manager-modal-placeholder"></div>')
    });

    var toDoAlertListItemView = Backbone.ListItemView.extend({
        editing_template: ToDoLists.templates.toDoAlertListItemEditingTemplate,
        item_model: ToDoLists.models.toDoAlertModel,
        get_item_model_options: function($inputs){
            var time = $inputs.filter("#id_time_date").val() + " " + $inputs.filter("#id_time_time").val();
            return {
                time: time,
                todo_id: this.options.parent_todo.get("id")
            };
        },
        change_save_button_after_success: function($button_elem){
            $button_elem.html('<i class="icon-ok icon-white"></i>');
        },
    });

    var toDoAlertManagerView = Backbone.ManagerView.extend({
        item_view: toDoAlertListItemView,
        template: ToDoLists.templates.toDoAlertManagerViewTemplate,
        insert_subview: function(subview){
            this.$("div.control-group:last").after(subview.$el);
        },
        get_subview_options: function(item){
            return {
                el: $(this.subview_elem_template),
                model: item,
                parent_todo: this.collection.parent_todo
            }
        },
        render_subview: function(options){
            Backbone.ManagerView.prototype.render_subview.call(this, options);
            options.el.find("#id_time_date").datepicker({format: 'yyyy-mm-dd'});
            options.el.find("#id_time_time").timepicker({minuteStep: 1, showMeridian: false});
        }
    });

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
                todo_lists.push(new ToDoLists.models.toDoListModel(todo_list_data));
            });
            delete bootstrapped_todo_lists;

            this.todo_list_collection = new ToDoLists.models.toDoListCollection(todo_lists);
        },
        initialize_todo_context_collection: function(){
            var todo_contexts = [];
            _.each(bootstrapped_todo_contexts, function(todo_context_data){
                todo_contexts.push(new ToDoLists.models.toDoContextModel(todo_context_data));
            });
            delete bootstrapped_todo_contexts;

            this.todo_context_collection = new ToDoLists.models.toDoContextCollection(todo_contexts);
        },
        initialize_todo_tag_collection: function(){
            var todo_tags = [];
            _.each(bootstrapped_todo_tags, function(todo_tag_data){
                todo_tags.push(new ToDoLists.models.toDoTagModel(todo_tag_data));
            });
            delete bootstrapped_todo_tags;

            this.todo_tag_collection = new ToDoLists.models.toDoTagCollection(todo_tags);           
        },
        initialize_todo_collection: function(){
            this.todo_collection = new ToDoLists.models.toDoCollection([], {
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

    ToDoLists.views.filterItemView = filterItemView;
    ToDoLists.views.toDoAddView = toDoAddView;
    ToDoLists.views.toDoContextFilterView = toDoContextFilterView;
    ToDoLists.views.toDoNotDoneFilterView = toDoNotDoneFilterView;
    ToDoLists.views.toDoPriorityFilterView = toDoPriorityFilterView;
    ToDoLists.views.toDoTagFilterView = toDoTagFilterView;
    ToDoLists.views.toDoFilterManagerView = toDoFilterManagerView;
    ToDoLists.views.toDoListActionsView = toDoListActionsView;
    ToDoLists.views.toDoDetailsView = toDoDetailsView;
    ToDoLists.views.toDoListItemView = toDoListItemView;
    ToDoLists.views.toDoListView = toDoListView;
    ToDoLists.views.toDoListListItemView = toDoListListItemView;
    ToDoLists.views.toDoListFilterView = toDoListFilterView;
    ToDoLists.views.toDoListManagerModalView = toDoListManagerModalView;
    ToDoLists.views.toDoListManagerModalHandlerView = toDoListManagerModalHandlerView;
    ToDoLists.views.toDoContextListItemView = toDoContextListItemView;
    ToDoLists.views.toDoContextManagerModalView = toDoContextManagerModalView;
    ToDoLists.views.toDoContextManagerModalHandlerView = toDoContextManagerModalHandlerView;
    ToDoLists.views.toDoAlertListItemView = toDoAlertListItemView;
    ToDoLists.views.toDoAlertManagerView = toDoAlertManagerView;
    ToDoLists.views.markItDoneManagerView = markItDoneManagerView;
})(Backbone, ToDoLists);