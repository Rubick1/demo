



//接受一个generator，并运行
// function run(generator){
//   iterator = generator()
//   // Promise.resolve().then(()=>next())
//   next()

//   function next(val){
//     const obj = iterator.next(val)
//     //next里面决定是否需要继续next
//     if(!obj.done){
//       next(obj.value)
//     } 
//   }

// }



/* 
上面这个只是自动执行一个生成器 没有跟promise结合
把promise跟生成器结合起来的关键在于每次yield一个promise，然后通过这个promise来控制生成器的迭代
如果是fulfilled，就用完成的值继续运行promise，调用next(val),如果是rejected，就用reject的值调用throw(val)
*/

function foo(x,y) {
  return request(
      "http://some.url.1/?x=" + x + "&y=" + y
  );
}
function *main() {
  try {
      var text = yield foo( 11, 31 );
      console.log( text );
  }
  catch (err) {
      console.error( err );
} }

//先尝试一下怎么手动让main运行

it = main()
p = it.next().value
p.then(val=>{
  it.next(val)
},err=>{
  it.throw(err)
})


//直接返回一个promise就可以了，但是需要注意错误处理
//每一次it.next 或者it.throw都是在向生成器发送消息 从返回值里面接收消息
function run(gen,...args){
  const it = gen(...args)
  return Promise.resolve()
  .then(function handleNext(value){
    const next = it.next(value)
    //这个handleResult是立即执行函数，调用这一次返回的next
    return (function handleResult(next){
      if(next.done){
        return next.value
      }
      return Promise.resolve(next.value).then(handleNext,function handleError(err){
        return Promise.resolve(it.throw(err)).then(handleResult)
      })
    })(next)
  })
}




