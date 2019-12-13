
// let data = require('../jsons/data.json');
const fs = require('fs');
const path = require("path");

class methods{

    constructor(){
        
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

        console.log(" 333 ;.LKSDFJLK;JSFJHKSDHM");
        let user = req.session.user;
        try{
            let find = await this.userExists(user);
            if(find.found){
                let origin = await this.readData();
                let data = origin[find.index].data;
                console.log(data);
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
        let rawdata = fs.readFileSync(path.resolve(__dirname,'../jsons/data.json'));
        let data = JSON.parse(rawdata);
        return data;
    }

    async writeData(data){
        let stringed = JSON.stringify(data);
        fs.writeFileSync(path.resolve(__dirname,'../jsons/data.json'),stringed);
    }

}

module.exports = methods;