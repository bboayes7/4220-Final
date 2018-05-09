const projectComponent = {
  template: `
  <div class="container">
      <div class="card" v-for="data in content" v-on:click=app.collapse(data.id)>
          <div class="card-body">
              <div class="card-header">
                  <h3>
                      Project Name -
                      <strong>{{data.name}}</strong>
                      </h3>
                      <div v-if="data.active == true">
                  <button v-on:click="app.deleteProject(data.id)">Delete Project</button>


              <input v-model="data.todoName" placeholder="write TodoName" type="text">
              <input v-model="data.todoDes" placeholder="write TodoDes" type="text">
                  <button v-on:click="app.sendToDo(data.id,data.todoName,data.todoDes)">
                  <i class="fa fa-plus-square" style="color:Green">
                      add to do to {{data.name}}</i>
                  </button>
              <ul class="list-group">
                  <div v-for="todo in data.todos">
                     <li class="list-group-item">
                     <input v-if = "todo.edit == true"  type="text" v-model="todo.name">
                     To-Do -  {{todo.name}}
                     </br>
                     Description - {{todo.description}}

                     <button v-on:click="app.deleteToDo(data.id, todo.id)"> Delete </button>

                     <span class="icon">
                      <button v-if="todo.edit == true" @click="todo.edit = false">
                      Done
                      </button>
                      <button v-if="todo.edit == false" @click="todo.edit = true">
                      Edit
                      </button>
                          </span>

                     </li>
                     </div>

                  </div>

                  </ul>
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
        loggedIn: false,
        //add collapse varible
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
        },
        sendProject: function () {
            console.log(`projectname : ${this.projectName}`)
            if (!this.projectName)
                return

            socket.emit('send-projects', { projectName: this.projectName })
        },
        sendToDo: function (id, name,des) {
            console.log(id)
            console.log(name)
            console.log(des)
            socket.emit('send-todo', { projectId: id, todoName: name, todoDes: des})
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
        collapse: function(projectId){
          console.log(projectId);
          socket.emit('set-active', {projectId: projectId});
        },
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
