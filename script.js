
const MAX_DFS_DEPTH = 35

function createGrid(name){
const container = document.getElementById(name + "-grid")

for(let i=0;i<9;i++){
const input = document.createElement("input")
input.maxLength = 1
input.oninput = updateVisualization
container.appendChild(input)
}
}

function getState(name){
const values = [...document.querySelectorAll("#"+name+"-grid input")]
.map(x => Number(x.value) || 0)

return [
values.slice(0,3),
values.slice(3,6),
values.slice(6,9)
]
}

function setState(name,state){
const flat = state.flat()

document.querySelectorAll("#"+name+"-grid input")
.forEach((el,i)=> el.value = flat[i])

updateVisualization()
}

function clearGrid(name){
document.querySelectorAll("#"+name+"-grid input")
.forEach(x => x.value = "")

updateVisualization()
}

function clearAll(){
clearGrid("initial")
clearGrid("goal")

document.getElementById("results").innerHTML =
"Time: - <br> Nodes Expanded: - <br> Path Cost: -"
}

function updateVisualization(){
draw(getState("initial"))
}

function draw(state){
const viz = document.getElementById("viz-grid")

viz.innerHTML = ""

state.flat().forEach(v=>{
const d = document.createElement("div")
d.className = "tile"
d.innerText = v || ""
viz.appendChild(d)
})
}

function serialize(state){
return JSON.stringify(state)
}

function neighbors(state){

let x,y

for(let i=0;i<3;i++)
for(let j=0;j<3;j++)
if(state[i][j]===0){
x=i
y=j
}

const dirs=[[1,0],[-1,0],[0,1],[0,-1]]

const result=[]

for(const d of dirs){

const nx=x+d[0]
const ny=y+d[1]

if(nx>=0 && ny>=0 && nx<3 && ny<3){

const copy=JSON.parse(JSON.stringify(state))

;[copy[x][y],copy[nx][ny]]=[copy[nx][ny],copy[x][y]]

result.push(copy)
}
}

return result
}

function manhattan(a,b){

let dist=0

for(let i=0;i<3;i++)
for(let j=0;j<3;j++){

const val=a[i][j]

if(val!==0){

for(let x=0;x<3;x++)
for(let y=0;y<3;y++)

if(b[x][y]===val)

dist+=Math.abs(i-x)+Math.abs(j-y)

}

}

return dist
}

function bfs(start,goal){

const queue=[[start,[]]]

const visited=new Set()

let nodes=0

while(queue.length){

const [state,path]=queue.shift()

const key=serialize(state)

if(visited.has(key)) continue

visited.add(key)

nodes++

if(key===serialize(goal))
return {path:[...path,state], nodes}

for(const n of neighbors(state))
queue.push([n,[...path,state]])

}
}

function dfs(start,goal){

const stack=[[start,[],0]]

const visited=new Set()

let nodes=0

while(stack.length){

const [state,path,depth]=stack.pop()

const key=serialize(state)

if(visited.has(key)) continue

visited.add(key)

nodes++

if(key===serialize(goal))
return {path:[...path,state], nodes}

if(depth<MAX_DFS_DEPTH){

for(const n of neighbors(state))
stack.push([n,[...path,state], depth+1])

}
}
}

function astar(start,goal){

const open=[[start,[],0]]

const visited=new Set()

let nodes=0

while(open.length){

open.sort((a,b)=>a[2]-b[2])

const [state,path]=open.shift()

const key=serialize(state)

if(visited.has(key)) continue

visited.add(key)

nodes++

if(key===serialize(goal))
return {path:[...path,state], nodes}

for(const n of neighbors(state)){

const g=path.length+1
const h=manhattan(n,goal)

open.push([n,[...path,state], g+h])

}
}
}

function inversions(state){

const arr=state.flat().filter(x=>x!==0)

let inv=0

for(let i=0;i<arr.length;i++)
for(let j=i+1;j<arr.length;j++)
if(arr[i]>arr[j]) inv++

return inv
}

function isSolvable(a,b){
return inversions(a)%2===inversions(b)%2
}

function solve(){

const start=getState("initial")
const goal=getState("goal")

if(!isSolvable(start,goal)){
alert("Not solvable")
return
}

const algo=document.querySelector("input[name='algo']:checked").value

const t0=performance.now()

const result =
algo==="bfs" ? bfs(start,goal) :
algo==="dfs" ? dfs(start,goal) :
astar(start,goal)

const time=(performance.now()-t0)/1000

animate(result.path)

document.getElementById("results").innerHTML=
"Time: "+time.toFixed(3)+" s <br> Nodes Expanded: "+result.nodes+" <br> Path Cost: "+(result.path.length-1)
}

function animate(path){

let i=0

const timer=setInterval(()=>{

draw(path[i])

i++

if(i>=path.length) clearInterval(timer)

},300)
}

function randomState(){

let arr=[0,1,2,3,4,5,6,7,8]

arr.sort(()=>Math.random()-0.5)

return [arr.slice(0,3),arr.slice(3,6),arr.slice(6,9)]
}

function randomInitial(){

let g=getState("goal")

let r

do{ r=randomState() }
while(!isSolvable(r,g))

setState("initial",r)
}

function randomGoal(){

let i=getState("initial")

let r

do{ r=randomState() }
while(!isSolvable(i,r))

setState("goal",r)
}

createGrid("initial")
createGrid("goal")
createGrid("viz")

setState("initial", [[1,2,3],[8,0,4],[7,6,5]])

setState("goal", [[2,8,1],[0,4,3],[7,6,5]])
