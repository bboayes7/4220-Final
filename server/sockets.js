module.exports = (server) => {
    const
        io = require('socket.io')(server),
        moment = require('moment')

    let users = []
    let projects = []
    const todoArchive = []
    let projectsCounter = 0;//id for projects

    // when the page is loaded in the browser the connection event is fired
    io.on('connection', socket => {

        // on making a connection - load in the content already present on the server
        socket.emit('refresh-projects', projects)
        socket.emit('refresh-users', users)
        //on logging in to the server
        socket.on('join-user', userName => {
            let flag = false
            const length = users.length;
            //checks if username is in users array
            for(let i =0;i< length;i++)
            {
                if(users[i].name.toLowerCase()==userName.toLowerCase())
                {
                    flag = true;
                    break;
                }
            }
            if(flag == true)// if found, then emit a fail join otherwise let use join in
            {
                io.to(socket.id).emit('failed-join', flag)
            }
            else{
                const user = {
                id: socket.id,
                name: userName
            }
            users.push(user)
            io.emit('successful-join', user)
        }

        })
        //on adding a project to server
        socket.on('send-projects', data => {
            console.log(`data : ${data.projectName}`)
            const project = {
                id: projectsCounter,
                name: data.projectName,
                date: moment(new Date()).format('MM/DD/YY h:mm a'),
                todos: [],
                toDoIdCounter:0 //To Do task id counter 
            }
            console.log(`project : ${project.id} & ${project.name} & ${project.date} & ${project.todos} &  ${project.toDoIdCounter}`);
            projectsCounter++;
            projects.push(project)
            io.emit('successful-project', project)
        })
        //on adding a task to project. needs ProjectID, name for task, description for task and user name.
        socket.on('send-todo', data => {
            console.log(`hi this is send-todo and your data is ${data.todoName} & ${data.todoDes}`)
            const projectIndex = projects.findIndex(project =>{
                return project.id == data.projectId})
            const todo = {
                projectId: data.projectId,
                id: projects[projectIndex].toDoIdCounter,
                name: data.todoName,
                description:data.todoDes,
                startDate: moment(new Date()).format('MM/DD/YY h:mm a'),
                finishDate: "",
                writtenBy: data.userName,
                finishedBy:"",
                completed: false

            }
           
            projects[projectIndex].toDoIdCounter++;
            projects[projectIndex].todos.push(todo);
            io.emit('refresh-projects', projects)
        })
        socket.on('delete-project', data => {
            const projectIndex = projects.findIndex(project =>{
                return project.id == data.projectId})
            
            delete projects[projectIndex]
            projects = projects.filter(function (n) { return n != undefined });

            io.emit('refresh-projects', projects)
        })
        socket.on('delete-todo', data => {
            const projectIndex = projects.findIndex(project =>{
                return project.id == data.projectId})
            const todoIndex = projects[projectIndex].todos.findIndex(todo =>{
                    return todo.id == data.todoId})
            delete  projects[projectIndex].todos[todoIndex]
           projects[projectIndex].todos= projects[projectIndex].todos.filter(function (n) { return n != undefined });
           io.emit('refresh-projects', projects)
        })
        socket.on('edit-todo', data => {
            const projectIndex = projects.findIndex(project =>{
                return project.id == data.projectId})
            const todoIndex = projects[projectIndex].todos.findIndex(todo =>{
                    return todo.id == data.todoId})
              projects[projectIndex].todos[todoIndex].name = data.todoName
              projects[projectIndex].todos[todoIndex].description = data.todoDes

           io.emit('refresh-projects', projects)
        })
        socket.on('toggle-todo', data => {
            const projectIndex = projects.findIndex(project =>{
                return project.id == data.projectId})
            const todoIndex = projects[projectIndex].todos.findIndex(todo =>{
                    return todo.id == data.todoId})
              projects[projectIndex].todos[todoIndex].completed = data.flag

           io.emit('refresh-projects', projects)
        })

        socket.on('disconnect', () => {
            users = users.filter(user => {
                return user.id != socket.id
            })

            io.emit('refresh-users', users)
        })
    })
}
