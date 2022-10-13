import * as Koa from 'koa';
import {Server as HttpServer} from 'http'

import * as KoaBodyparser  from 'koa-bodyparser'
import {outputCatch}  from './middleware/outputCatch'
import {generateRouter}  from './middleware/router'
import {VaasWorkPool} from './worker/pool'
import {GetAppNameByRequest, GetAppConfigByAppName} from '../types/server'



export class VaasServer {
    server:HttpServer
    run({
        appsDir, port, 
        getAppNameByRequest, getAppConfigByAppName, showErrorStack
    }:{
        appsDir:string,port:number,
        getAppNameByRequest:GetAppNameByRequest, 
        getAppConfigByAppName:GetAppConfigByAppName,
        showErrorStack:boolean
    }):Promise<Koa> {
        const vaasWorkPool = new VaasWorkPool({
            appsDir,
            getAppConfigByAppName
        })
        const app = new Koa();
        app.use(outputCatch({showErrorStack}))
        app.use(KoaBodyparser({
            formLimit:'30mb',
            jsonLimit:'30mb',
            textLimit:'30mb',
            xmlLimit:'30mb',
        }))
        app.use(generateRouter({
            vaasWorkPool,getAppNameByRequest,
        }))
        return new Promise((resolve)=>{
            this.server = app.listen(port,()=>{
                resolve(app)
            });
        })
        
    }
    close():Promise<boolean> {
        return new Promise((resolve,reject)=>{
            this.server.close((error)=>{
                if(error)reject(error)
                resolve(true)
            })
        })
    }
}