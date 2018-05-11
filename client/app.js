const projectComponent = {
    template: `
    <div class="container">
    <div class="card" v-for="data in content">
        <div class="card-body">
            <div class="card-header">
                <h2 class="title">
                    <strong>{{data.name}}</strong>

                    <div v-if="data.active == true" class="btn-group float-right dropright">
                        <button class="btn btn-secondary btn-sm" type="button" v-on:click=app.collapse(data.id)>
                            <i class="fas fa-minus"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true"
                            aria-expanded="false" id="dropdown1">
                            <span class="sr-only">Toggle Dropdown</span>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="dropdown1">
                            <button class="dropdown-item" type="button" v-on:click="app.deleteProject(data.id)">Delete Project</button>
                        </div>
                    </div>
                    <div v-else class="btn-group float-right dropright">
                        <button class="btn btn-secondary btn-sm" type="button" v-on:click=app.collapse(data.id)>
                            <i class="fas fa-plus"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true"
                            aria-expanded="false" id="dropdown2">
                            <span class="sr-only">Toggle Dropdown</span>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="dropdown2">
                            <button class="dropdown-item" type="button" v-on:click="app.deleteProject(data.id)">Delete Project</button>
                        </div>
                    </div>

            </div>

            </h2>
            <transition name="fade">
                <div v-show="data.active == true">
                    <div class="form-group">
                        <input class="form-control form-control-sm" v-model="data.todoName" placeholder="Title" type="text" v-on:keyup.enter="app.sendToDo(data.id,data.todoName,data.todoDes)">
                        <input class="form-control form-control-sm" v-model="data.todoDes" placeholder="Description" type="text" v-on:keyup.enter="app.sendToDo(data.id,data.todoName,data.todoDes)">
                        <button type="button" class="form-control btn btn-success form-control-sm" v-on:click="app.sendToDo(data.id,data.todoName,data.todoDes)">Add To-Do</button>
                    </div>


                    <ul class="list-group">
                        <div v-for="todo in data.todos">
                            <li class="list-group-item" v-if="!todo.complete">
                                <div v-if="todo.edit == true">
                                    <div class="input-group">
                                        <input class="form-control form-control-sm" type="text" v-model="todo.name" v-on:keyup.enter="app.editToDo(todo.projectId, todo.id, todo.name, todo.description)">
                                        <div class="input-group-btn btn-group float-right">

                                            <button class="btn btn-primary" @click="todo.edit = false" v-on:click="app.editToDo(todo.projectId, todo.id, todo.name, todo.description)">
                                                Done
                                            </button>
                                            <button class="btn btn-danger" v-on:click="app.deleteToDo(data.id, todo.id)"> Delete </button>
                                        </div>

                                    </div>
                                    <input class="form-control form-control-sm" type="text" v-model="todo.description" v-on:keyup.enter="app.editToDo(todo.projectId, todo.id, todo.name, todo.description)">

                                </div>

                                <div v-else>
                                    <div class="d-flex justify-content-between">
                                        <h4 class="mb-1">{{todo.name}}</h4>

                                        <div class="btn-group float-right">

                                            <button type="button" class="btn btn-sm btn-light" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="dropdown2">
                                                <i class="fas fa-cog"></i>
                                            </button>
                                            <span class="sr-only">Toggle Dropdown</span>
                                            </button>
                                            <div class="dropdown-menu" aria-labelledby="dropdown2">
                                                <button class="dropdown-item" v-on:click="app.deleteToDo(data.id, todo.id)"> Delete </button>
                                                <button class="dropdown-item" @click="todo.edit = true">
                                                    Edit
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                    <small class="text-muted">{{todo.description}}</small>
                                    <div v-if="todo.complete == true">
                                        <input type="checkbox" id="checkbox" v-on:click="app.toggleToDo(todo.projectId, todo.id)" checked>
                                        <button v-on:click="app.toggleToDo(todo.projectId, todo.id)">
                                            <i class="fas fa-check"></i>
                                        </button>

                                    </div>
                                    <div v-else>
                                        <button v-on:click="app.toggleToDo(todo.projectId, todo.id)">
                                            <i class="far fa-square"></i>
                                        </button>
                                        <input type="checkbox" id="checkbox" v-on:click="app.toggleToDo(todo.projectId, todo.id)">
                                    </div>
                                </div>
                            </li>
                        </div>
                    </ul>
            </transition>
            </div>
        </div>
    </div>
</div>
</div>`,
    props: ['content']
}




const socket = io()
const app = new Vue({
    el: '#todo-app',
    data: {
        projectName: '',
        projects: [],
        projectId: "",
        todoName: "",
        todoDes: "",
        todoId: "",
        alert: false
    },
    methods: {
        sendProject: function () {
            console.log(`projectname : ${this.projectName}`)
            if (!this.projectName)
                return

            socket.emit('send-projects', { projectName: this.projectName })
        },
        sendToDo: function (id, name, des) {
            if(!name || !des)
                return this.alert = true

            socket.emit('send-todo', { projectId: id, todoName: name, todoDes: des })
        },
        deleteProject: function (id) {
            console.log("Delete Project")
            console.log(id)
            socket.emit('delete-project', { projectId: id })
        },
        deleteToDo: function (id, todoId) {
            console.log(id)
            console.log(todoId)
            socket.emit('delete-todo', { projectId: id, todoId: todoId })
        },
        editToDo: function (projectId, todoId, todoName, todoDes) {

            socket.emit('edit-todo', { projectId: projectId, todoId: todoId, todoName: todoName, todoDes: todoDes })
        },
        toggleToDo: function (projectId, todoId) {
            console.log("CLIENTSIDE")
            console.log(`${projectId} && ${todoId}`)
            socket.emit('toggle-todo', { projectId: projectId, todoId: todoId })
        },
        collapse: function (projectId) {
            console.log(projectId);
            socket.emit('set-active', { projectId: projectId });
        },
        archiveToDo: function(){
            socket.emit('archive-todo')
        }
    },
    components: {
        projectComponent
    }
})


// Client Side Socket Event
socket.on('refresh-projects', projects => {
    app.projects = projects
})
socket.on('refresh-users', users => {
    app.users = users
})

socket.on('successful-join', user => {
    // the successful-join event is emitted on all connections (open browser windows)
    // so we need to ensure the loggedIn is set to true and user is set for matching user only
    if (user.name === app.userName) {
        app.user = user
        app.loggedIn = true
        app.failLogin = false

    }

    app.users.push(user)
})
socket.on('failed-join', flag => {
    if (app.loggedIn == false) {
        app.failLogin = flag
    }

})

socket.on('successful-project', content => {
    // clear the message after success send
    app.projectName = ''
    app.projects.push(content)
})
