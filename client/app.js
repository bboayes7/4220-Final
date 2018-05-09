const projectComponent = {
    template: ` 
    <div class="container">

        <div class="card" v-for="data in content">
        <button v-on:click="app.sendProject2(this.projectName)" v-model="this.projectName">this.projectName</button>

            <div class="card-body">
                <div class="card-header">
                    <h3>
                        {{data.id}}
                        <strong>{{data.name}}</strong>
                        <strong>{{data.active}}</strong>
                    </h3>
                </div>

                <ul class="list-group">
                    <div v-for="todo in data.todos">
                       <li class="list-group-item">{{todo.id}} {{todo.name}}</li>
                    </div> 
                </ul>
            </div>
        </div>
    </div>`,
    props: ['content'],
    data: function () {
        return {
            projectName: 'uck'
        }
    

}}





const socket = io()
const app = new Vue({
    el: '#todo-app',
    data: {
        hello: "",

        loggedIn: false,
        failLogin: false,
        userName: '',
        user: {},
        users: [],
        projectName: '',
        projects: [],
        projectId: "",
        todoName: "",
        todoDes: "",
        todoId: ""

    },
    methods: {
        joinUser: function () {
            if (!this.userName)
                return

            socket.emit('join-user', this.userName)
        },sendProject2: function (Pname) {
            

            socket.emit('send-projects', { projectName: Pname })
        },
        sendProject: function (projectName) {
            if (!this.projectName)
                return

            socket.emit('send-projects', { projectName: this.projectName })
        },
        sendToDo: function () {
            if (!this.projectId)
                return
            if (!this.todoName)
                return
            if (!this.todoDes)
                return

            socket.emit('send-todo', { projectId: this.projectId, todoName: this.todoName, todoDes: this.todoDes, userName: this.userName })
        },
        deleteProject: function () {
            if (!this.projectId)
                return

            socket.emit('delete-project', { projectId: this.projectId })
        },
        deleteToDo: function () {
            if (!this.projectId)
                return
            if (!this.todoId)
                return

            socket.emit('delete-todo', { projectId: this.projectId, todoId: this.todoId })
        },
        editToDo: function () {
            if (!this.projectId)
                return
            if (!this.todoId)
                return
            if (!this.todoName)
                return
            if (!this.todoDes)
                return
            socket.emit('edit-todo', { projectId: this.projectId, todoId: this.todoId, todoName: this.todoName, todoDes: this.todoDes })
        },
        setActive: function () {
            if (!this.projectId)
                return
            
            socket.emit('set-active', { projectId: this.projectId})
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