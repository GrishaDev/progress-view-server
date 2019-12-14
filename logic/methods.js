
// let data = require('../jsons/data.json');
const fs = require('fs');
const path = require("path");
let MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;

class methods{

    constructor(){
        this.connectdb();
        setInterval(this.saveBackup.bind(this),3600000);
    }

    async auth(req,res){
        let user = req.body.user;
        try{
            let find = await this.userExists(user);

            if(find.found){
                req.session.user = user;
                console.log("exist");
            }
            else{
                await this.addUser(user,res);
                req.session.user = user;
                console.log("new");
            }
            res.json({status: true, msg:"auth done"});
        }
        catch(e){
            res.json({status: false, msg:"Error, server problem? >>"+e});
        }
    }

    async getData(req,res){
        if(!req.session.user){
            res.redirect('/');
            return;
        }

        let user = req.session.user;
        try{
            let find = await this.userExists(user);
            if(find.found){
                let origin = await this.readData();
                let data = origin[find.index].data;
                res.json({status: true, data: data});
            }
            else
                res.json({status: false, msg:"Error getting data "});
        }
        catch(e){
            res.json({status: false, msg:"Error getting data >>"+e});
        }
    }

    async updateData(req,res){
        if(!req.session.user){
            res.redirect('/');
            return;
        }

        // here should be req.post data  instead of let haha
        let data = req.body.data;

        try{
            let origin = await this.readData();
            //req.session.user;
            let user = req.session.user;;

            let find = await this.userExists(user);
            if(find.found){
                origin[find.index].data = data;
                await this.writeData(origin);
                res.json({status: true, msg:"Succesful data update"});
            }
            else{
                res.json({status: false, msg:"Error updating data"});
            }
           
        }
        catch(e){
            res.json({status: false, msg:"Error updating data >> "+e});
        }
    }

    // =========================================================================

    async addUser(user,res){
        try{
            let origin = await this.readData();
            origin.push({name: user,data: []});
            await this.writeData(origin);
            console.log("succesful");
        }
        catch(e){
            console.log("error adding user");
        }
    }

    async userExists(user){
        let data = await this.readData();

        for(let i=0; i<data.length; i++){
            if(data[i].name === user){
                return {index: i, found:true};
            }
        }
        return {index: undefined, found:false};
    }

    async readData(){
        // let rawdata = fs.readFileSync(path.resolve(__dirname,'../jsons/data.json'));
        // let data = JSON.parse(rawdata);
        // return data;
        let thing =  await this.collection.find();
        let data = await thing.toArray();
        return data[0].all;
    }

    async writeData(data){
        // let stringed = JSON.stringify(data);
        // fs.writeFileSync(path.resolve(__dirname,'../jsons/data.json'),stringed);
        let parsed = {all: data};
        // parsed=JSON.stringify(parsed);

        let res = await this.collection.replaceOne({}, parsed);
    }

    async saveBackup(){
        console.log("Saving backup...");
        let data = await this.readData();
        let stringed = JSON.stringify(data);
        fs.writeFileSync(path.resolve(__dirname,'../jsons/data_backup.json'),stringed);
    }



    // ============================================================================

    async connectdb(){
        try{
            this.mongo = await MongoClient.connect(uri,{ useNewUrlParser: true },{
                autoReconnect: true,
                reconnectTries: 1000000,
                reconnectInterval: 3000
            });

            // console.log("Ok");
            this.db = this.mongo.db('progressdb');
            this.collection = this.db.collection('data');
        }
        catch(err){
            console.log("Error connecting to mongo , "+err);
        }
    }
}

module.exports = methods;