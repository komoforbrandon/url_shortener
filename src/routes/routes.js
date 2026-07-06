import express from 'express'

const app = express()
export function History() {
  app.get('/', (req, res)=>{
    console.log('This is the history page')
    res.json({message: "Learning node Routes"})
  })
}