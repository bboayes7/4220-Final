// Chat Component
const chatComponent = {
    template: ` <div class="chat-box">
                   <p v-for="data in content">
                   <span><strong>{{data.id}}</strong> <small>{{data.name}}</small><span>
                       <br />
                       {{data.todos}}
                   </p>
               </div>`,
    props: ['content']
}

// Users Component
const usersComponent = {
    template: ` <div class="user-list">
                   <h6>Active Users ({{users.length}})</h6>
                   <ul v-for="user in users">
                       <li>
                       <img v-bind:src="user.avater" class="circle" width="30px">
                       <span>{{user.name}}</span>
                       </li>
                       <hr>
                   </ul>
               </div>`,
    props: ['users']
}




const socket = io()
const app = new Vue({
    el: '#chat-app',
    data: {
        loggedIn: false,
        Faillogin: false,
        userName: '',
        user: {},
        users: [],
        ProjectName: '',
        projects: [],
        ProjectID:"",
        TodoName:"",
        TodoDes:""
    },
    methods: {
        joinUser: function () {
            if (!this.userName)
                return

            socket.emit('join-user', this.userName)
        },
        sendProject: function () {
            if (!this.ProjectName)
                return

            socket.emit('send-projects', { ProjectName: this.ProjectName })
        },
        sendToDO: function () {
            if (!this.ProjectID)
                return
            if (!this.TodoName)
                return
            if (!this.TodoDes)
                return

            socket.emit('send-todo', { ProjectID: this.ProjectID,TodoName: this.TodoName,TodoDes: this.TodoDes,userName:this.userName })
        },
        editToDo: function(){
            socket.emit('edit-todo', editedTodo)
        }
    },
    components: {
        'users-component': usersComponent,
        'chat-component': chatComponent,

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
        app.Faillogin = false

    }

    app.users.push(user)
})
socket.on('failed-join', flag => {
    if(app.loggedIn == false)
    {
        app.Faillogin = flag
    }
    
})

socket.on('successful-project', content => {
    // clear the message after success send
    app.ProjectName = ''
    app.projects.push(content)
})
