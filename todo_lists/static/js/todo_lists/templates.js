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

(function(){
    var filterItemViewTemplate = '\
        <a data-action="filter" data-value="<%=filter_val%>" href="#"><%= filter_name %></a>\
    ';

    var toDoAddTemplate = '\
        <div  class="btn-group"> \
            <a data-action="show_add_object_modal" id="show-add-object-modal" class="btn btn-primary"><i class="icon-plus icon-white"></i></a> \
        </div> \
        <div class="modal fade" id="add-todo-modal" style="display:none;"> \
            <form method="POST" id="add-todo-form" class="form-horizontal"> \
                <div class="modal-header"> \
                    <button class="close" data-dismiss="modal">×</button> \
                        <h3>Add a Todo</h3> \
                </div> \
                <div class="modal-body"> \
                    <div class="control-group"> \
                        <label class="control-label" for="id_name">Name:</label> \
                        <div class="controls"> \
                            <input id="id_name" type="text" name="name"/> \
                            <span class="errors-info errors_name help-inline"></span> \
                        </div> \
                    </div> \
                    <div class="control-group"> \
                        <label class="control-label" for="id_notes">Notes:</label> \
                        <div class="controls"> \
                            <textarea id="id_notes" name="notes"></textarea> \
                            <span class="errors-info errors_notes help-block"></span> \
                        </div> \
                    </div> \
                    <div class="control-group"> \
                        <label class="control-label" for="id_tags">Tags:</label> \
                        <div class="controls"> \
                        <% if (filters.tags && todo_tags.get(filters.tags)){ \
                            var selected_todo_tag = todo_tags.get(filters.tags); \
                            var name = selected_todo_tag.get("name"); \
                        %> \
                            <%=name%>, \
                            <input type="hidden" value="<%=name%>" name="predefined_todo_tag" id="id_predefined_todo_tag"> \
                        <% } \
                        %> \
                            <input type="text" name="tags" id="id_tags" /> \
                            <span class="errors-info errors_tags help-inline"></span> \
                        </div> \
                    </div> \
                    <div class="control-group"> \
                        <label class="control-label" for="id_due_time_date">Due date and time:</label> \
                        <div class="controls"> \
                            <input style="display:inline;" class="span5" type="text" name="due_time_date" id="id_due_time_date"> \
                            <input style="display:inline;" class="span3" type="text" name="due_time_time" id="id_due_time_time"> \
                            <span class="errors-info errors_due_time help-inline"></span> \
                        </div> \
                    </div> \
                    <div class="control-group"> \
                        <label class="control-label" for="id_priority">Priority:</label> \
                        <div class="controls"> \
                        <% if (filters.priority){ \
                            var name; \
                            if (filters.priority == 1){ \
                                name = "Low"; \
                            }else if(filters.priority == 2){ \
                                name = "Normal"; \
                            }else{ \
                                name = "High"; \
                            } \
                        %> \
                            <%=name%> \
                            <input type="hidden" value="<%=filters.priority%>" name="priority" id="id_priority"> \
                        <% }else{ \
                        %> \
                            <select name="priority" id="id_priority"> \
                                <option value="1">Low</option> \
                                <option value="2" selected="selected">Normal</option> \
                                <option value="3">High</option> \
                            </select> \
                        <% } %> \
                            <span class="errors-info errors_priority help-inline"></span> \
                        </div> \
                    </div> \
                    <div class="control-group"> \
                        <label class="control-label" for="id_todo_list">List:</label> \
                        <div class="controls"> \
                        <% if (filters.todo_list && todo_lists.get(filters.todo_list)){ \
                            var selected_todo_list = todo_lists.get(filters.todo_list); \
                            var name = selected_todo_list.get("name"); \
                            var id = selected_todo_list.get("id"); \
                        %> \
                            <%=name%> \
                            <input type="hidden" value="<%=id%>" name="todo_list" id="id_todo_list"> \
                        <% }else{ \
                        %> \
                            <select name="todo_list" id="id_todo_list"> \
                                <% \
                                    _.each(todo_lists.models, function(todo_list){ \
                                        var id = todo_list.get("id"); \
                                        var name = todo_list.get("name"); \
                                %> \
                                    <option value="<%=id%>"><%= name %></option> \
                                <% \
                                    }); \
                                %> \
                            </select> \
                        <% } %> \
                            <span class="errors-info errors_todo_list help-inline"></span> \
                        </div> \
                    </div> \
                    <div class="control-group"> \
                        <label class="control-label" for="id_todo_context">Context:</label> \
                        <div class="controls"> \
                        <% if (filters.todo_context && todo_contexts.get(filters.todo_context)){ \
                            var selected_todo_context = todo_contexts.get(filters.todo_context); \
                            var name = selected_todo_context.get("name"); \
                            var id = selected_todo_context.get("id"); \
                        %> \
                            <%=name%> \
                            <input type="hidden" value="<%=id%>" name="todo_context" id="id_todo_context"> \
                        <% }else{ \
                        %> \
                            <select name="todo_context" id="id_todo_context"> \
                                <option  value="">---------------------------</option> \
                                <% \
                                    _.each(todo_contexts.models, function(todo_context){ \
                                        var id = todo_context.get("id"); \
                                        var name = todo_context.get("name"); \
                                %> \
                                    <option value="<%=id%>"><%= name %></option> \
                                <% \
                                    }); \
                                %> \
                            </select> \
                        <% } %> \
                            <span class="errors-info errors_todo_context help-inline"></span> \
                        </div> \
                    </div> \
                </div> \
                <div class="modal-footer"> \
                    <a href="#" data-dismiss="modal" class="btn">Cancel</a> \
                    <a data-action="add_object" data-next="add" href="#" class="btn btn-primary add-todo-button">Save and add another</a> \
                    or \
                    <a data-action="add_object" data-next="hide" href="#" class="btn btn-success add-todo-button">Save and close</a> \
                </div> \
            </form> \
        </div> \
    ';

    var toDoContextFilterTemplate = '\
        <a class="btn dropdown-toggle" data-toggle="dropdown" href="#"> \
            <span class="chosen-filter">All contexts</span> \
            <span class="caret"></span> \
        </a> \
        <ul class="dropdown-menu"> \
            <li><a data-action="reset_filter" href="#">All contexts</a></li> \
            <li class="divider items-divider"></li> \
            <li class="divider"></li> \
            <li class="todo-context-manager-placeholder"><a href="#">Manage Contexts</a></li> \
        </ul> \
    ';

    var toDoNotDoneFilterTemplate = '\
        <a class="btn dropdown-toggle" data-toggle="dropdown" href="#"> \
            <span class="chosen-filter">To do and done</span> \
            <span class="caret"></span> \
        </a> \
        <ul class="dropdown-menu"> \
            <li><a data-action="reset_filter" href="#">To do and done</a></li> \
            <li class="divider items-divider"></li> \
        </ul> \
    ';

    var toDoPriorityFilterTemplate = '\
        <a class="btn dropdown-toggle" data-toggle="dropdown" href="#"> \
            <span class="chosen-filter">All priorities</span> \
            <span class="caret"></span> \
        </a> \
        <ul class="dropdown-menu"> \
            <li><a data-action="reset_filter" href="#">All priorities</a></li> \
            <li class="divider items-divider"></li> \
        </ul> \
    ';

     var toDoTagFilterTemplate = '\
        <a class="btn dropdown-toggle" data-toggle="dropdown" href="#"> \
            <span class="chosen-filter">All tags</span> \
            <span class="caret"></span> \
        </a> \
        <ul class="dropdown-menu"> \
            <li><a data-action="reset_filter" href="#">All tags</a></li> \
            <li class="divider items-divider"></li> \
        </ul> \
    ';

    var toDoListActionFilterTemplate = '\
        <div class="btn-group not-done-filter filter"></div> \
        <div class="btn-group context-filter filter"></div> \
        <div class="btn-group tag-filter filter"></div> \
        <div class="btn-group priority-filter filter"></div> \
    ';

    var toDoListActionsTemplate = '\
        <div class="span2"> \
            <div id="add_todo" class="btn-toolbar"></div> \
        </div> \
        <div class="span10"> \
            <div id="filter_todos" class="btn-toolbar pull-right"></div> \
        </div> \
    ';

    var toDoDetailsTemplate = '\
        <div class="span2 btn-group"> \
            <a class="btn" data-action="hide"><i class="icon-zoom-out"></i></a> \
            <a class="btn btn-primary edit_todo" data-action="edit"><i class="icon-edit icon-white"></i></a> \
        </div> \
        <div class="span5"> \
        <% \
            var name = model.get("name"); \
            var due_time = model.get("due_time") || "Not set"; \
            var priority = model.get("priority")[1]; \
            var list_name = model.get("todo_list").name; \
            var context_name = model.get("todo_context") ? model.get("todo_context").name : "No context"; \
            var notes = model.get("notes") || "No notes"; \
            var tags = model.get("tags"); \
        %> \
            <dl class="dl-horizontal"> \
                <dt>Name</dt> \
                <dd><%=name%></dd> \
                <dt>Due time</dt> \
                <dd><%=due_time%></dd> \
                <dt>Priority</dt> \
                <dd><%=priority%></dd> \
                <dt>List</dt> \
                <dd><%=list_name%></dd> \
                <dt>Context</dt> \
                <dd><%=context_name%></dd> \
                <dt>Tags</dt> \
                <dd> \
        <% \
            if(tags.length > 0){ \
            _.each(model.get("tags"), function(tag){ \
        %> \
                <%=tag.name%> \
        <% \
            }); \
            }else{ \
        %> \
            No tags \
        <% \
            } \
        %> \
                </dd> \
                <dt>Notes</dt> \
                <dd><%=notes%></dd> \
            </dl> \
        </div> \
        <div class="span5 manage-todo-alerts"> \
        </div> \
    ';

    var toDoDetailsEditingTemplate = '\
        <div class="span2 btn-group"> \
            <a class="btn" data-action="hide"><i class="icon-zoom-out"></i></a> \
            <a class="btn cancel_todo_edition" data-action="cancel"><i class="icon-chevron-left"></i></a> \
            <a class="btn btn-success save_todo" data-action="save"><i class="icon-ok icon-white"></i></a> \
        </div> \
        <div class="span5"> \
        <% \
            var name = model.get("name"); \
            var due_time = model.get("due_time"); \
            if (due_time){ \
                var date = due_time.split(" ")[0]; \
                var time = due_time.split(" ")[1]; \
            } \
            var priority = model.get("priority")[0]; \
            var list_id = model.get("todo_list").id; \
            var context_id = model.get("todo_context") ? model.get("todo_context").id : undefined; \
            var notes = model.get("notes"); \
        %> \
            <form method="POST" id="change-todo-form" class="form-horizontal"> \
                <div class="control-group"> \
                    <label class="control-label" for="id_name">Name:</label> \
                    <div class="controls"> \
                        <input id="id_name" type="text" name="name" value="<%=name%>"/> \
                        <span class="errors-info errors_name help-inline"></span> \
                    </div> \
                </div> \
                <div class="control-group"> \
                    <label class="control-label" for="id_due_time_date">Due date and time:</label> \
                    <div class="controls"> \
                        <input style="display:inline;" class="span4" type="text" name="due_time_date" id="id_due_time_date" <%if(due_time){%>value="<%=date%>"<%}%>> \
                        <input style="display:inline;" class="span3" type="text" name="due_time_time" id="id_due_time_time" <%if(due_time){%>value="<%=time%>"<%}%>> \
                        <span class="errors-info errors_due_time help-inline"></span> \
                    </div> \
                </div> \
                <div class="control-group"> \
                    <label class="control-label" for="id_priority">Priority:</label> \
                    <div class="controls"> \
                        <% if (filters.priority){ \
                            var name; \
                            if (filters.priority == 1){ \
                                name = "Low"; \
                            }else if(filters.priority == 2){ \
                                name = "Normal"; \
                            }else{ \
                                name = "High"; \
                            } \
                        %> \
                            <%=name%> \
                            <input type="hidden" value="<%=filters.priority%>" name="priority" id="id_priority"> \
                        <% }else{ \
                        %> \
                        <select name="priority" id="id_priority"> \
                            <option value="1" <%if(priority==1){%>selected="selected"<%}%> >Low</option> \
                            <option value="2" <%if(priority==2){%>selected="selected"<%}%>>Normal</option> \
                            <option value="3" <%if(priority==3){%>selected="selected"<%}%>>High</option> \
                        </select> \
                        <% } %> \
                        <span class="errors-info errors_priority help-inline"></span> \
                    </div> \
                </div> \
                <div class="control-group"> \
                    <label class="control-label" for="id_todo_list">List:</label> \
                    <div class="controls"> \
                        <% if (filters.todo_list && todo_lists.get(filters.todo_list)){ \
                            var selected_todo_list = todo_lists.get(filters.todo_list); \
                            var name = selected_todo_list.get("name"); \
                            var id = selected_todo_list.get("id"); \
                        %> \
                            <%=name%> \
                            <input type="hidden" value="<%=id%>" name="todo_list" id="id_todo_list"> \
                        <% }else{ \
                        %> \
                        <select name="todo_list" id="id_todo_list"> \
                            <% \
                                _.each(todo_lists.models, function(todo_list){ \
                                    var id = todo_list.get("id"); \
                                    var list_name = todo_list.get("name"); \
                            %> \
                                <option value="<%=id%>" <%if(list_id==id){%>selected="selected"<%}%>><%= list_name %></option> \
                            <% \
                                }); \
                            %> \
                        </select> \
                        <% } %> \
                        <span class="errors-info errors_todo_list help-inline"></span> \
                    </div> \
                </div> \
                <div class="control-group"> \
                    <label class="control-label" for="id_todo_context">Todo context:</label> \
                    <div class="controls"> \
                        <% if (filters.todo_context && todo_contexts.get(filters.todo_context)){ \
                            var selected_todo_context = todo_contexts.get(filters.todo_context); \
                            var name = selected_todo_context.get("name"); \
                            var id = selected_todo_context.get("id"); \
                        %> \
                            <%=name%> \
                            <input type="hidden" value="<%=id%>" name="todo_context" id="id_todo_context"> \
                        <% }else{ \
                        %> \
                        <select name="todo_context" id="id_todo_context"> \
                            <option  value="">---------------------------</option> \
                            <% \
                                _.each(todo_contexts.models, function(todo_context){ \
                                    var id = todo_context.get("id"); \
                                    var context_name = todo_context.get("name"); \
                            %> \
                                <option value="<%=id%>" <%if(context_id==id){%>selected="selected"<%}%>><%= context_name %></option> \
                            <% \
                                }); \
                            %> \
                        </select> \
                        <% } %> \
                        <span class="errors-info errors_todo_context help-inline"></span> \
                    </div> \
                </div> \
                <div class="control-group"> \
                    <label class="control-label" for="id_tags">Tags:</label> \
                    <div class="controls"> \
                        <% \
                            var tags = "", name=""; \
                            var selected_todo_tag, name, id; \
                            _.each(model.get("tags"), function(tag_info){ \
                                if(tag_info.id == filters.tags){ \
                                    id = tag_info.id; \
                                    name = tag_info.name; \
                                }else{ \
                                    if(tags){ \
                                        tags += ","; \
                                    } \
                                    tags += tag_info.name; \
                                } \
                            }); \
                            if(filters.tags){ \
                        %> \
                            <input type="hidden" value="<%=name%>" name="predefined_todo_tag" id="id_predefined_todo_tag"> \
                            <%=name%>, \
                        <% } %> \
                        <input type="text" name="tags" id="id_tags" value="<%=tags%>"/> \
                        <span class="errors-info errors_tags help-inline"></span> \
                    </div> \
                </div> \
                <div class="control-group"> \
                    <label class="control-label" for="id_notes">Notes:</label> \
                    <div class="controls"> \
                        <textarea id="id_notes" name="notes"><%=notes%></textarea> \
                        <span class="errors-info errors_notes help-block"></span> \
                    </div> \
                </div> \
            </form> \
        </div> \
        <div class="span5 manage-todo-alerts"> \
        </div> \
    ';

    var toDoListItemTemplate = '\
            <div class="span2"> \
                <a class="btn" data-action="show_item_details"><i class="icon-zoom-in"></i></a> \
            </div> \
            <div class="span2"> \
        <% \
            var is_done = Boolean(model.get("completion_time")); \
            var due_time = model.get("due_time"); \
            var name = model.get("name"); \
            if (due_time){ \
        %> \
            <%= due_time %> \
        <% \
            }else{ \
        %> \
            No due time set \
        <% \
            } \
        %> \
            </div> \
            <div class="span6"> \
                <%= name %> \
            </div> \
            <div class="span2 btn-group"> \
        <% \
            if (is_done){ \
        %> \
            <a class="btn btn-danger mark_undone" data-action="mark_undone"><i class="icon-check icon-white"></i></a> \
            <a class="btn btn-danger delete_todo" data-action="remove_item"><i class="icon-trash icon-white"></i></a> \
        <% \
            }else{ \
        %> \
            <a class="btn btn-success mark_done" data-action="mark_done"><i class="icon-check icon-white"></i></a> \
            <a class="btn btn-danger delete_todo" data-action="remove_item"><i class="icon-trash icon-white"></i></a> \
        <% \
            } \
        %> \
            </div> \
    ';

    var toDoListTemplate = '\
        <a class="btn btn-primary" data-action="load_more" style="display:none;">Load more</a> \
    ';

    var toDoListListItemEditingTemplate = '\
        <% \
            var name, id; \
            name = id = ""; \
            if (model){ \
                name = model.get("name"); \
                id = model.get("id"); \
            } \
        %> \
            <div class="input-append" data-todo-list-id="<%=id%>"> \
                <input type="text" value="<%=name%>"><button class="btn-success" type="button" data-action="save_item"><% if (id){%>Change<%}else{%>Save<%}%></button><button class="btn-danger" type="button" data-action="remove_item">Remove</button> \
                <span class="help-inline"></span> \
            </div> \
    ';

    var toDoListFilterTemplate = '\
        <ul class="nav nav-list"> \
            <li class="nav-header">Todos</li> \
            <li class="active"><a data-action="reset_filter" href="#">All</a></li> \
            <li class="nav-header lists-header">Lists</li> \
            <li class="divider"></li> \
            <li class="todo-list-manager-placeholder"></li> \
        </ul> \
    ';

     var toDoListManagerModalTemplate = '\
        <div class="modal fade" id="manage-todo-lists-modal" style="display:none;"> \
            <form method="POST" id="manage-todo-lists-form" class="form-horizontal"> \
                <div class="modal-header"> \
                    <button class="close" data-dismiss="modal">×</button> \
                        <h3>Manage ToDo Lists</h3> \
                </div> \
                <div class="modal-body"> \
                    <div class="control-group"> \
                        <a href="#" class="btn btn-primary" data-action="add_line">Add another</a> \
                    </div> \
                </div> \
            </form> \
        </div> \
    ';

    var toDoListManagerModalHandlerTemplate = '\
        <a data-action="manage_items" href="#">Manage Lists</a> \
    ';

    var toDoContextListItemTemplate = '\
        <%  \
            var name = model.get("name"); \
        %> \
            <%= name %> \
    ';

    var toDoContextListItemEditingTemplate = '\
        <%  \
            var name, id; \
            name = id = ""; \
            if (model){ \
                name = model.get("name"); \
                id = model.get("id"); \
            } \
        %> \
            <div class="input-append" data-model-id="<%=id%>"> \
                <input type="text" value="<%=name%>"><button class="btn-success" type="button" data-action="save_item"><% if (id){%>Change<%}else{%>Save<%}%></button><button class="btn-danger" type="button" data-action="remove_item">Remove</button> \
                <span class="help-inline"></span> \
            </div> \
    ';

    var toDoContextManagerModalTemplate = '\
        <div class="modal fade" id="manage-todo-contexts-modal" style="display:none;"> \
            <form method="POST" id="manage-todo-contexts-form" class="form-horizontal"> \
                <div class="modal-header"> \
                    <button class="close" data-dismiss="modal">×</button> \
                        <h3>Manage ToDo Contexts</h3> \
                </div> \
                <div class="modal-body"> \
                    <div class="control-group"> \
                        <a href="#" class="btn btn-primary" data-action="add_line">Add another</a> \
                    </div> \
                </div> \
            </form> \
        </div> \
    ';

    var toDoContextManagerModalHandlerTemplate = '\
        <a data-action="manage_items" href="#">Manage Contexts</a> \
    ';

    var toDoAlertListItemEditingTemplate = '\
        <% \
            var date, time, id; \
            date = time = id = ""; \
            if (model){ \
                alert_time = model.get("time"); \
                var date = alert_time.split(" ")[0]; \
                var time = alert_time.split(" ")[1]; \
                id = model.get("id"); \
            } \
        %> \
            <div class="input-append"> \
                <input style="display:inline;" class="span4" type="text" name="due_time_date" id="id_time_date" value="<%=date%>"> \
                <input style="display:inline;" class="span4" type="text" name="due_time_time" id="id_time_time" value="<%=time%>"><button class="btn-success" type="button" data-action="save_item" rel="tooltip" title="save alert"><i class="<% if (id){%>icon-ok<%}else{%>icon-plus<%}%> icon-white"></i></button><button class="btn-danger" type="button" data-action="remove_item" rel="tooltip" title="remove alert"><i class="icon-remove icon-white"></i></button> \
                <span class="help-inline"></span> \
            </div> \
    ';

    var toDoAlertManagerViewTemplate = '\
        <form id="manage-todo-alerts-form"> \
            <div class="control-group"> \
                <span>Alerts: </span><a href="#" class="btn btn-primary" data-action="add_line" rel="tooltip" title="add alert"><i class="icon-plus icon-white"></i></a> \
            </div> \
        </form> \
    ';

    ToDoLists.templates.filterItemViewTemplate = filterItemViewTemplate;
    ToDoLists.templates.toDoAddTemplate = toDoAddTemplate;
    ToDoLists.templates.toDoContextFilterTemplate = toDoContextFilterTemplate;
    ToDoLists.templates.toDoNotDoneFilterTemplate = toDoNotDoneFilterTemplate;
    ToDoLists.templates.toDoPriorityFilterTemplate = toDoPriorityFilterTemplate;
    ToDoLists.templates.toDoTagFilterTemplate = toDoTagFilterTemplate;
    ToDoLists.templates.toDoListActionFilterTemplate = toDoListActionFilterTemplate;
    ToDoLists.templates.toDoListActionsTemplate = toDoListActionsTemplate;
    ToDoLists.templates.toDoDetailsTemplate = toDoDetailsTemplate;
    ToDoLists.templates.toDoDetailsEditingTemplate = toDoDetailsEditingTemplate;
    ToDoLists.templates.toDoListItemTemplate = toDoListItemTemplate;
    ToDoLists.templates.toDoListTemplate = toDoListTemplate;
    ToDoLists.templates.toDoListListItemEditingTemplate = toDoListListItemEditingTemplate;
    ToDoLists.templates.toDoListFilterTemplate = toDoListFilterTemplate;
    ToDoLists.templates.toDoListManagerModalTemplate = toDoListManagerModalTemplate;
    ToDoLists.templates.toDoListManagerModalHandlerTemplate = toDoListManagerModalHandlerTemplate;
    ToDoLists.templates.toDoContextListItemTemplate = toDoContextListItemTemplate;
    ToDoLists.templates.toDoContextListItemEditingTemplate = toDoContextListItemEditingTemplate;
    ToDoLists.templates.toDoContextManagerModalTemplate = toDoContextManagerModalTemplate;
    ToDoLists.templates.toDoContextManagerModalHandlerTemplate = toDoContextManagerModalHandlerTemplate;
    ToDoLists.templates.toDoAlertListItemEditingTemplate = toDoAlertListItemEditingTemplate;
    ToDoLists.templates.toDoAlertManagerViewTemplate = toDoAlertManagerViewTemplate;
})(ToDoLists);
