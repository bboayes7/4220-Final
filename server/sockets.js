module.exports = (server) => {
    const
        io = require('socket.io')(server),
        moment = require('moment')
    let projects = []
    const todoArchive = []
    let projectsCounter = 0;//id for projects
    const findToDoIndex = (projectIndex, toDoId) => projects[projectIndex].todos.findIndex(todo => {
        return todo.id == toDoId})
    const findProjectIndex = (projectIndex) => projects.findIndex(project => { 
        return project.id == projectIndex })
    // when the page is loaded in the browser the connection event is fired
    io.on('connection', socket => {

        // on making a connection - load in the content already present on the server
        socket.emit('refresh-projects', projects)
        socket.emit('refresh-todoArchive', todoArchive)
        
      
        
        //on adding a project to server
        socket.on('send-projects', data => {
            const project = {
                id: projectsCounter,
                name: data.projectName,
                date: moment(new Date()).format('MM/DD/YY h:mm a'),
                todos: [],
                toDoIdCounter: 0, //To Do task id counter  
                active:false  
            }
            projectsCounter++;
            projects.push(project)
            io.emit('successful-project', project)
        })
        //on adding a task to project. needs ProjectID, name for task, description for task.
        socket.on('send-todo', data => {
            const projectIndex = findProjectIndex(data.projectId)
            const todo = {
                projectId: data.projectId,
                id: projects[projectIndex].toDoIdCounter,
                name: data.todoName,
                description: data.todoDes,
                startDate: moment(new Date()).format('MM/DD/YY h:mm a'),
                finishDate: "",
                completed: false
            }
            projects[projectIndex].toDoIdCounter++;
            projects[projectIndex].todos.push(todo);
            io.emit('refresh-projects', projects)
        })
        socket.on('delete-project', data => {
            const projectIndex = findProjectIndex(data.projectId)
            delete projects[projectIndex]
            projects = projects.filter(function (n) { return n != undefined });
            io.emit('refresh-projects', projects)
        })
        socket.on('delete-todo', data => {
            const projectIndex = findProjectIndex(data.projectId)
            const toDoIndex = findToDoIndex(projectIndex, data.todoId)
            delete projects[projectIndex].todos[toDoIndex]
            projects[projectIndex].todos = projects[projectIndex].todos.filter(function (n) { return n != undefined });
            io.emit('refresh-projects', projects)
        })
        socket.on('edit-todo', data => {
            const projectIndex = findProjectIndex(data.projectId)
            const toDoIndex = findToDoIndex(projectIndex, data.todoId)
            console.log(toDoIndex)
            projects[projectIndex].todos[toDoIndex].name = data.todoName
            projects[projectIndex].todos[toDoIndex].description = data.todoDes

            io.emit('refresh-projects', projects)
        })
        socket.on('toggle-todo', data => {
            const projectIndex = findProjectIndex(data.projectId)
            const toDoIndex = findToDoIndex(projectIndex, data.todoId)
            if(projects[projectIndex].todos[toDoIndex].completed == false)
            {
                projects[projectIndex].todos[toDoIndex].completed = true
                projects[projectIndex].todos[toDoIndex].finishDate = moment(new Date()).format('MM/DD/YY h:mm a')
            }
            else{
                projects[projectIndex].todos[toDoIndex].completed = false
                projects[projectIndex].todos[toDoIndex].finishDate = ""
            }

            io.emit('refresh-projects', projects)
        })
        socket.on('archive-todo', data => {
            const projectsLength = projects.length;
            for (let j = 0; j < projectsLength; j++) {
                const toDoLength =projects[j].todos.length
                for (let i = 0; i < toDoLength; i++) {
          
                  if (projects[j].todos[i].completed === true) {
                    todoArchive.push(projects[j].todos[i])
                    delete projects[j].todos[i];
                  }
                }
                projects[j].todos = projects[j].todos.filter(function (n) { return n != undefined });
              }

            io.emit('refresh-projects', projects)
            io.emit('refresh-todoArchive', todoArchive)

        })
        socket.on('set-active', data => {
            const projectIndex = findProjectIndex(data.projectId)

            projects.forEach(project =>{
                project.active = false
            })
            projects[projectIndex].active= true

            io.emit('refresh-projects', projects)

        })
        })
    })
}
