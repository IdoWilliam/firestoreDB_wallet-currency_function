const functions = require('firebase-functions');
var admin = require("firebase-admin");
const FieldValue = require('firebase-admin').firestore.FieldValue;
admin.initializeApp();
const db = admin.firestore();

exports.readData = functions.https.onRequest((req,res)=>{   
  // FireStore 에서 데이터 읽어오기
  db.collection('users').doc('M9ZgaFa8RprZlchPRuPf').get()
    .then( doc => {
        console.log(doc.id, '=>' , doc.data());
        
        let docs = doc.data();

        res.send(200);
      })
    .catch(err=>{
      res.send("err : " + err);
    })
});
exports.addData = functions.https.onRequest((req,res)=>{
  db.collection('food').doc("fruit").add( //set은 특정 doc에 추가 add는 새로운 doc을 생성해서 추가
  {
    man : 'mango',
    maple : 'qq',
    cake : 'zz',
  },{merge: true})//중복되는것은 추가되지 않고 새로운데이터만 추가
  .then(function(){
    console.log("success to add data!");
    res.sendStatus(200);
  })
  .catch(function(err){
    console.log("fail to add data",err);
    res.sendStatus(500);
  });
})
exports.deleteData = functions.https.onRequest((req,res)=>{
  // 문서삭제
  db.collection('user2').doc('company').delete()
  .then(function(){
    console.log("success to delete document!");
    res.sendStatus(200);
  })
  .catch(function(err){
    console.log("fail to delete document",err);
    res.sendStatus(500);
  }) 
  
  //특정필드 제거 
  db.collection('users').doc('fruit').update({
    star: FieldValue.delete()
  })
  .then(function(){
    console.log("success to delete field!!");
    res.sendStatus(200);
  })
  .catch(function(err){
    console.log("fail to delete field!",err);
    res.sendStatus(500);
  })  
})
  // wallet_id 유무 판별
  /*
  db.collection('users').get()
  .then(snapshot =>{
    snapshot.forEach(doc =>{
      if(doc.id == walletId){
        
      }
    })
    error_code.err_msg = `(${walletId}).해당주소의 wallet은 존재하지않습니다.`
    res.send(error_code);
  })
  .catch(err=>{
    res.send(`Error : ${err}`);
  })
  */
///////////////////////////////////////////// firestore wallet/ dc /////////////////////////////////////////////
let normal_code = {
  code : 1,
  message : "요청이 정상적으로 처리되었습니다.",
}
let unknown_code = {
  code : 0,
  message : "요청한 기능이 존재하지 않습니다.",
}
let error_code = {
  code : -1,
  message : "알 수 없는 요청입니다.",
}
const IDOwallet = 'IDOwallet';
const IDOcurrency = 'IDOcurrency';

//지갑생성(가입)
exports.createWallet = functions.https.onRequest((req,res)=>{
  var user_name = req.body.user_name;
  var phone_number = req.body.phone_number;
  var bank_name = req.body.bank_name;
  var bank_account = req.body.bank_account;
  if(req.body.recovery_email != undefined){
    var recovery_email = req.body.recovery_email;
  }else{
    var recovery_email = null;
  }
  var data_public_key = req.body.data_public_key;
  var fcm_token = req.body.fcm_token;
  //var currency_list = []; 월렛 화페목록 항목 삭제

  user_name = "kim";  //테스트데이터
  phone_number = Math.floor(Math.random() * 100000) + 1;
  bank_name ="kookmin";
  bank_account="123456789";
  recovery_email ="william@ido.so";
  data_public_key = "public_key";
  fcm_token ="token_key"; 

  let userRef = db.collection(IDOwallet);

  userRef.add({
    user_name : user_name,
    phone_number : phone_number,
    bank_name :bank_name,
    bank_account : bank_account,
    recovery_email : recovery_email,
    data_public_key : data_public_key,
    fcm_token : fcm_token,
  })
  .then(function(){
    userRef.where('phone_number','==',phone_number).get()
    .then(result =>{
      result.forEach(doc =>{
        let result ={ 'wallet_id' : doc.id };
        normal_code.result = result;
        console.log(normal_code);
        res.send(normal_code);
      })
    })
    .catch(err=>{
      error_code.err_msg = "error :"+ err;
      res.send(error_code);
    })
  })
  .catch(err=>{
    error_code.err_msg ="error :" + err;
    res.send(error_code);
  });
})

//지갑검색
exports.findWallet = functions.https.onRequest((req,res)=>{
  var user_name = 'kim'; //테스트데이터//req.body.user_name;
  var phone_number = 12972; //테스트데이터//req.body.user_name;

  let userRef = db.collection(IDOwallet);
  userRef.where('user_name','==',user_name).where('phone_number','==',phone_number).get()
    .then(result =>{
      if(result.empty){
        unknown_code.err_msg = "해당 user_name 과 phone_number를 가진 wallet은 존재하지 않습니다.";
        res.send(unknown_code);
      }else{
      result.forEach(doc =>{
        let result ={ 'wallet_id' : doc.id };
        normal_code.result = result;
        console.log(normal_code);
        res.send(normal_code);
        });
      }
    })
    .catch(err =>{
      error_code.err_msg ="error :" + err;
      res.send(error_code);
    });
})

//지갑조회
exports.getWalletInfo = functions.https.onRequest((req,res)=>{
  const wallet_id = "4UVxQHGX1YUXsONOgUrl" //테스트데이터//req.body.wallet_id;
  let walletRef = db.collection(IDOwallet).doc(wallet_id);

  walletRef.get()
  .then(doc =>{
      docs = doc.data();
      delete docs.fcm_token;
      normal_code.result=docs;
      console.log(normal_code);
      res.send(normal_code);
  })
  .catch(err=>{
    error_code.err_msg ="error :" + err;
    res.send(error_code);
  })
})

/*
화폐리스트를 가져올때 
wallet_id를 받아서 wallet 컬렉션의 current_list를 가져오게끔 구현 -> 에서 아래와같이 변경(wallet에 currency_list 항목 삭제)
idocurrencyList에서 화폐들의 owner, target,name 중에 값이 하나라도 해당 wallet_id 이면 가져오는 함수 
create - owner , order - target , bill -name ,  pay - owner , cancel = target ,exchange - owner 
*/

//거래화폐 조회 
exports.getCurrencyList = functions.https.onRequest((req,res)=>{
  const wallet_id = "4UVxQHGX1YUXsONOgUrl"; //테스트데이터// req.body.wallet_id;

  let currencyRef = db.collection(IDOcurrency);
  let count = 0;
  let currencyIDListOfWallet = [];

  const checkCurrencyHasWalletID = (currencyIDListOfWallet) =>{
    normal_code.result = {currencyInfo : currencyIDListOfWallet};
    console.log(normal_code);
    res.send(normal_code);
  }

  currencyRef.get()
    .then(currencyList=>{
      currencyList.forEach(currency=>{
        currencyID = currency.id;
        currencyRef.doc(currencyID).get()
        .then(doc=>{

          count++;
          JSONrecord=doc.data();
          record = JSONrecord.record;

          for(var i in record){
            if(record[i].owner==wallet_id || record[i].target==wallet_id || record[i].name==wallet_id){
                currencyIDListOfWallet.push(doc.id);
              break;
            }
          }
          if(count==currencyList.size){
            checkCurrencyHasWalletID(currencyIDListOfWallet);
          }    
        })
        .catch(err=>{
          error_code.err_msg ="error :" + err;
          res.send(error_code);
        })
      })
    })
    .catch(err=>{
      error_code.err_msg ="error :" + err;
      res.send(error_code);
    })
})

//지갑정보수정
exports.updateWalletInfo = functions.https.onRequest((req,res)=>{
  var newName = req.body.user_name;
  var newNumber = req.body.phone_number;
  var newBank = req.body.bank_name;
  var newAccount = req.body.bank_account;
  var newEmail = req.body.recovery_email;
  var newToken = req.body.fcm_token;
  var walletId = '4UVxQHGX1YUXsONOgUrl';//테스트데이터//req.body.id;

  var walletRef = db.collection(IDOwallet).doc(walletId);

  db.runTransaction(t => {
    return t.get(walletRef)
      .then(()=> {
        checkAtLeastOne = 0;
        (newName != undefined)? t.update(walletRef, {user_name : newName}) : checkAtLeastOne++;
        (newNumber != undefined)? t.update(walletRef, {phone_number : newNumber}) : checkAtLeastOne++; 
        (newBank != undefined)? t.update(walletRef, {bank_name : newBank}) : checkAtLeastOne++; 
        (newAccount != undefined)? t.update(walletRef, {bank_account : newAccount}) : checkAtLeastOne++; 
        (newEmail != undefined)? t.update(walletRef, {recovery_email : newEmail}) : checkAtLeastOne++; 
        (newToken != undefined)? t.update(walletRef, {fcm_token : newToken}) : checkAtLeastOne++; 
        if(checkAtLeastOne==6){
          error_code.err_msg="최소 한가지 이상 정보를 입력하세요";
          console.log(error_code);
          res.send(error_code);
        }else{
          res.send(normal_code);
        }
      });
  })
  .catch(err=>{
    error_code.err_msg ="error :" + err;
    res.send(error_code);
  })
})

//지갑삭제
exports.removeWallet = functions.https.onRequest((req,res)=>{
  const walletId ='4UVxQHGX1YUXsONOgUrl'; //테스트데이터//   req.body.id;
 
  let WalletRef = db.collection(IDOwallet);
  
  WalletRef.get()
  .then(snapshot =>{
    checkWalletIdExist =0;
    snapshot.forEach(doc =>{
      if(doc.id == walletId) checkWalletIdExist++;
    })
    if(checkWalletIdExist = 1){
      db.collection('users').doc(walletId).delete();
      res.send(normal_code);
    }else{ 
      error_code.err_msg = `(${walletId}).해당주소의 wallet은 존재하지않습니다.`
      console.log(error_code);
      res.send(error_code);
    }
  })
  .catch(err=>{
    res.send(`Error : ${err}`);
  })

})

//DC발행
exports.createCurrency = functions.https.onRequest((req,res)=>{
  const wallet_id ='3Qeph5z5cwBMWxyLeL4K';  //테스트데이터//req.body.wallet_id;
  const category = 'escrow'; //테스트데이터//req.body.category;
  const amount = 280000;//테스트데이터// req.body.amount;
  const type = 'create';
  const todayDate = new Date();

  const arrRecord = [{
    owner : wallet_id,
    type : type,
    category : category,
    amount : amount,
    date : todayDate
  }];

  let DCRef = db.collection(IDOcurrency)

  DCRef.add({record : arrRecord})
  .then(function(){
    DCRef.where('record','==',arrRecord).get()
    .then(result =>{
      result.forEach(doc =>{
        let result ={ 'currency_id' : doc.id };
        normal_code.result = result;
        console.log(normal_code);
        res.send(normal_code);
      })
    })
    .catch(err=>{
      error_code.err_msg = "error :"+ err;
      res.send(error_code);
    })
  })
  .catch(err=>{
    error_code.err_msg ="error :" + err;
    res.send(error_code);
  });

})

//DC이력 조회
exports.readCurrencyHistory = functions.https.onRequest((req,res)=>{
  const currency_id ='kszyTsL0SvRiLwn9eg3k'; //테스트데이터//req.body.currency_id;
  let DCRef = db.collection(IDOcurrency).doc(currency_id);

  DCRef.get()
  .then(doc =>{
      docs = doc.data();
      normal_code.result = docs;
      console.log(normal_code);
      res.send(normal_code);
  })
  .catch(err=>{
    error_code.err_msg ="error :" + err;
    res.send(error_code);
  })
})

//DC 사용 (송금/청구/구매확인/환전)
exports.useCurrency = functions.https.onRequest((req,res)=>{
  const currency_id ='fbNz0gXgcZ3qLDXwFXY8'; //테스트데이터//req.body.currency_id;
  let DCRef = db.collection(IDOcurrency).doc(currency_id);

  const todayDate = new Date();
  var event ={ date : todayDate, type : 'order', target : 'acasdq2143fedwf', method : 'remote'}; //req.body.event;

  db.runTransaction(t=>{
    return t.get(DCRef)
    .then(doc =>{
      newRecord = doc.data().record;
      newRecord.push(event);

      t.update(DCRef, {record : newRecord});
    });
  }).then(result=>{
    res.send(normal_code);
  }).catch(err=>{
    error_code.err_msg ="error :" + err;
    res.send(error_code);
  });

})



