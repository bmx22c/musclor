// app.get('/')

const express = require("express")
const app = express()

//-----------------------------------------CONNEXION BD
let mongodb = require("mongodb")
let MongoClient = mongodb.MongoClient;
const client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true });
let db = null;
client.connect(err => {
    db = client.db("musclor")
})
let ObjectId = require('mongodb').ObjectId

function findExo(exo){
    return new Promise(resolveFindExo => {
        db.collection('exo').findOne({ name: exo }).then((result) => {
            resolveFindExo(result)
        })    
    })
}

function insertExo(exo){
    return new Promise(resolveInsertExo => {
        db.collection('exo').insertOne({ name: exo }).then((result) => {
            resolveInsertExo(result.insertedId)
        })
    })
}

function insertRep(exo, rep, poids){
    return new Promise(resolveInsertRep => {
        db.collection('rep').insertOne({ exo: exo, rep: rep, poids: poids }).then((result) => {
            resolveInsertRep(result.insertedId)
        })
    })
}

async function processExo(nom, rep, poids){
    exoId = ''

    exo = await findExo(nom)
    console.log('avant if')
    if(exo === null){
        console.log('dans if')
        await insertExo(nom)
        console.log('dans if 2')
        exo = await findExo(nom)
    }

    exoId = exo._id

    repDB = await insertRep(exoId, rep, poids)

    console.log(repDB)
    console.log(typeof repDB)

    if (repDB == null){
        console.log('error')
    }else{
        console.log('good')
    }

    return exoId
}



//---------------------------------------------ROUTES STATIQUES

app.use("/css", express.static(__dirname + "/css"))
app.use("/js", express.static(__dirname + "/js"))


//--------------------------------------------ROUTE UNIQUE DE FRONT

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/html/index.html")
})

app.get("/list", (req, res) => {
    res.sendFile(__dirname + "html/list.html")
})

app.get("/stats", (req, res) => {
    res.sendFile(__dirname + "html/stats.html")
})

app.get('/exo/list', (req, res) => {
    db.collection("exo").find({ }).toArray((err, docs) => {
        res.json(docs)
    })
})

app.get('/all/list', (req, res) => {
    db.collection('rep').aggregate([
        { $lookup:
            {
                from: 'exo',
                localField: 'exo',
                foreignField: '_id',
                as: 'exo'
            }
        }
    ]).toArray((err, docs) => {
        var unique = []
        docs.forEach(exo => {
            if(exo.exo.length != 0){
                var found = false
                unique.forEach(elem => {
                    if(elem.name == exo.exo[0].name){
                        found = true
                    }
                });
                if(!found){
                    unique.push(exo.exo[0])
                }
            }
        });
        res.json(JSON.stringify(unique))
    })
})

app.get('/rep/list', (req, res) => {
    db.collection("rep").find({ }).sort({ _id: 1 }).toArray((err, docs) => {
        res.json(docs)
    })
})

app.get('/exo/list/:id', (req, res) => {
    if(req.params['id'] != undefined && req.params['id'] != null){
        db.collection('rep').find({ exo: new ObjectId(req.params['id']) }).toArray((err, docs) => {
            console.log(docs)
            res.json(docs)
        })
    }else{
        res.json({ status: false })
    }
    // res.json(req.params)
    // res.json(req.params['id'])
    // db.collection("rep").find({ }).toArray((err, docs) => {
    //     res.json(docs)
    // })
})

app.get('/rep/remove/:id', (req, res) => {
    if(req.params['id'] != undefined && req.params['id'] != null){
        db.collection('rep').deleteOne({ _id: new ObjectId(req.params['id']) }).then((result) => {
            console.log(result.deletedCount)
            if(result.deletedCount > 0){
                res.json({ status: true })
            }else{
                res.json({ status: false })
            }
        })
    }else{
        res.json({ status: false })
    }
})

app.get('/exo/save/:id', (req, res) => {
    res.json("update")
    // res.json(req.params)
})

app.get('/exo/save/', (req, res) => {
    // res.json("new")
    let data = req.query
    let nom = data['name']
    let rep = data['rep']
    let poids = data['poids']

    console.log('before process')
    console.log(processExo(nom, rep, poids))
    console.log('after process')

    res.json(req.params)
})

app.listen(1337)