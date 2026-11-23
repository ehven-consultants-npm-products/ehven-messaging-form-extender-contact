import assert from 'node:assert/strict';
import test from 'node:test';
import { validateContactSubmission, createContactValidator } from '../src/index.mjs';
import { handleContactRequest } from '../src/server.mjs';
import { createDeliveryPipeline } from '@ehven/messaging-form-core/server';
const values={first_name:'Example',last_name:'Person',email:'user@example.org',email_confirmation:'user@example.org',source:'contact',website:'',message:' First line\r\nSecond line '};
const request=(change={},accept='application/json')=>new Request('https://example.org/api/contact',{method:'POST',headers:{Accept:accept},body:new URLSearchParams({...values,...change})});
test('contact normalization preserves message line breaks and the shared identity contract',()=>{
  const result=validateContactSubmission(values);assert.equal(result.ok,true);assert.equal(result.data.message,'First line\nSecond line');
});
test('contact requires a bounded string message and rejects hostile controls',()=>{
  for(const message of ['', 'x'.repeat(5001), '\0hidden', new Blob(['file'])])assert.equal(validateContactSubmission({...values,message}).ok,false);
});
test('identity, field name, length and validation copy are consumer configured',()=>{
  const validate=createContactValidator({identity:{required:{lastName:false}},messageField:'inquiry',messageLimit:4,messages:{too_long:'Shorter please'}});
  assert.equal(validate({...values,last_name:'',inquiry:'yes'}).ok,true);
  assert.equal(validate({...values,inquiry:'longer'}).errors.at(-1).message,'Shorter please');
});
test('contact transport composes with core pipeline and preserves acceptance after receipt failure',async()=>{
  const sequence=[];
  const deliver=createDeliveryPipeline({accept:async data=>{sequence.push(data.message);},acknowledge:async()=>{throw Error('mail unavailable');}});
  const response=await handleContactRequest(request(),{}, {verifyHuman:async()=>({ok:true}),deliver});
  assert.equal(response.status,202);assert.equal((await response.json()).outcome,'accepted');assert.equal(sequence.length,1);
});
test('site routes remain injected and unsafe routes fall back through core',async()=>{
  const options={verifyHuman:async()=>({ok:true}),deliver:async()=>{},successLocations:{contact:'//external.example'},defaultSuccessLocation:'/thanks'};
  const response=await handleContactRequest(request({},'text/html'),{},options);assert.equal(response.headers.get('Location'),'/thanks');
});
test('contact validation precedes human verification and delivery',async()=>{
  let called=false;const response=await handleContactRequest(request({message:''}),{},{verifyHuman:()=>{called=true;},deliver:()=>{called=true;}});
  assert.equal(response.status,422);assert.equal(called,false);
});
test('message policy cannot reuse an identity field',()=>assert.throws(()=>createContactValidator({messageField:'email'})));
