module.exports = (server) => {
    const
        io = require('socket.io')(server),
        moment = require('moment')

    let users = []
    let projects = []
    const ToDoArchive = []
    let ProjectsCounter = 0;//id for projects

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
                name: userName,
                avater:`https://robohash.org/${userName}?set=set3`
            }
            users.push(user)
            io.emit('successful-join', user)
        }

        })
        //on adding a project to server
        socket.on('send-projects', data => {
            const project = {
                id: ProjectsCounter,
                name: data.ProjectName,
                date: moment(new Date()).format('MM/DD/YY h:mm a'),
                todos: [],
                ToDoIdCounter:0 //To Do task id counter 
            }
            ProjectsCounter++;
            projects.push(project)
            io.emit('successful-project', project)
        })
        //on adding a task to project. needs ProjectID, name for task, description for task and user name.
        socket.on('send-todo', data => {
            const projectindex = projects.findIndex(project =>{
                return project.id == data.ProjectID})
            const todo = {
                ProjectID: data.ProjectID,
                id: projects[projectindex].ToDoIdCounter,
                name: data.TodoName,
                description:data.TodoDes,
                startdate: moment(new Date()).format('MM/DD/YY h:mm a'),
                finishdate: "",
                writtenby:data.userName,
                finishedby:"",
                completed: false

            }
           
            projects[projectindex].ToDoIdCounter++;
            projects[projectindex].todos.push(todo);
            io.emit('refresh-projects', projects)
        })
        socket.on('delete-project', data => {
            const projectindex = projects.findIndex(project =>{
                return project.id == data.ProjectID})
            
            delete projects[projectindex]
            projects = projects.filter(function (n) { return n != undefined });

            io.emit('refresh-projects', projects)
        })
        socket.on('delete-todo', data => {
            const projectindex = projects.findIndex(project =>{
                return project.id == data.ProjectID})
            const todoindex = projects[projectindex].todos.findIndex(todo =>{
                    return todo.id == data.Todoid})
            delete  projects[projectindex].todos[todoindex]
           projects[projectindex].todos= projects[projectindex].todos.filter(function (n) { return n != undefined });
           io.emit('refresh-projects', projects)
        })
        socket.on('edit-todo', data => {
            const projectindex = projects.findIndex(project =>{
                return project.id == data.ProjectID})
            const todoindex = projects[projectindex].todos.findIndex(todo =>{
                    return todo.id == data.Todoid})
              projects[projectindex].todos[todoindex].name = data.TodoName
              projects[projectindex].todos[todoindex].description = data.TodoDes

           io.emit('refresh-projects', projects)
        })
        socket.on('toggle-todo', data => {
            const projectindex = projects.findIndex(project =>{
                return project.id == data.ProjectID})
            const todoindex = projects[projectindex].todos.findIndex(todo =>{
                    return todo.id == data.Todoid})
              projects[projectindex].todos[todoindex].completed = data.flag

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
