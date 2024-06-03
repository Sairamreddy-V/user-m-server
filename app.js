const express=require('express')
app=express()
app.use(express.json())
const cors=require('cors')
app.use(cors())


const {open}=require('sqlite')
const sqlite3=require('sqlite3')
const path=require('path')
const pathOfFile=path.join(__dirname,'/userDatabase/database.db')

let db

const initializingDbandServerConnection= async()=>{
    try{
        db=await open(
            {
                filename:pathOfFile,
                driver:sqlite3.Database,
            }
        )
        app.listen(3000,()=>{
            console.log(`server running at port 3000...`)
        })
    }catch(error){
        console.log(`dbError:${error.message}`)
    }
}

initializingDbandServerConnection()



app.get("/",()=>{
        response.send ("Hello")
})

// api for getting all the users in the user table
app.get('https://user-m-server-sairamreddy-vs-projects.vercel.app/users',async(request,response)=>{
    try{
        const search = request.query.search || "";
        const page = parseInt(request.query.page, 10) || 1;
        const limit=page*20
        const offset=(page-1)*limit
        const query=`
        SELECT 
            *
        FROM 
            user_table
        WHERE
            name LIKE ?
        LIMIT ${limit}
        OFFSET ${offset} 
        `
        const result=await db.all(query,[`%${search}%`])
        response.status(200).send({result})
    }catch(error){
        response.send(`/users-api-Error:${error.message}`)
    }
})

//api for to insert a user into the users table
app.post('https://user-m-server-sairamreddy-vs-projects.vercel.app/user',async(request,response)=>{
    try{
        const {name,dateOfBirth,contactNumber,emailId,userDiscription}=request.body
        const query=`
        INSERT INTO 
            user_table(name,date_of_birth,contact_number,email_id,user_discription)
        VALUES(
            '${name}',${dateOfBirth},'${contactNumber}','${emailId}','${userDiscription}'
        )
        `
        await db.run(query)
        response.status(200).send(`${name} created successfully`)
        console.log(`created successfully`)
    }catch(error){
        response.send(`/user-api-Error:${error.message}`)
        console.log(error.message)
    }
})

//api for the getting a user on Id
app.get('https://user-m-server-sairamreddy-vs-projects.vercel.app/user/:id',async(request,response)=>{
    try{
        const {id}=request.params
        const query=`
        SELECT 
            *
        FROM 
            user_table
        WHERE 
            id=${id};
        `
        const result=await db.get(query)
        response.status(200).send({result})
    }catch(error){
        response.send(`/user/:id-api-Error:${error.message}`)
    }
})


//api to edit the user
app.put('https://user-m-server-sairamreddy-vs-projects.vercel.app/edit-user/:id',async (request,response)=>{
    try{
        const {id}=request.params 
        const {name,dataOfBirth,contactNumber,emailId,userDiscription}=request.body
        const query=`
            UPDATE user_table
            SET
                name='${name}',date_of_birth='${dataOfBirth}',contact_number='${contactNumber}',email_id='${emailId}',user_discription='${userDiscription}'
            WHERE 
                id=${id}
        `
        await db.run(query)
        response.status(200).send(`user ${name} updated successfully`)
    }catch(error){
        response.send(`/edit-user/:id-api-Error:${error.message}`)
    }
})

// api to delete user
app.delete('https://user-m-server-sairamreddy-vs-projects.vercel.app/delete-user/:id',async(request,response)=>{
    try{
        const {id}=request.params
        const query=`
            DELETE FROM 
                user_table
            WHERE 
                id=${id}
        `
        await db.run(query)
        response.status(200).send(`User Deleted Successfully`)
    }catch(error){
        response.send( `${error.message} at /delete-user/:id`)
    }
})
