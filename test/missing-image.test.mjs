import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recordPage} from '../src/render.mjs';
const rec={id:'missing',nombre:'Sample',apellidos:'Person',fuente:'Synthetic source',confianza:'media',revisado:false,anio:1900,pagina:1,hogar:1};
for(const imagen of [undefined,'','https://example.invalid/image.jpg','../private.jpg']) {
 test(`Unavailable image ${String(imagen)} does not produce a false viewer or image link`,()=>{
  for(const [lang,message] of [['es','La imagen original no está disponible para esta ficha.'],['en','The original image is not available for this record.']]){
   const h=recordPage({...rec,imagen},{lang,title:'Sample'});
   assert.ok(h.includes(message));
   assert.ok(!h.includes('id="viewer"'));
   assert.ok(!h.includes('class="doc"'));
   assert.ok(!h.includes('class="linecrop"'));
   assert.ok(h.includes('id="cite"'));
   assert.ok(h.includes('Synthetic source'));
  }
 });
}
test('A valid local image keeps the viewer and original link',()=>{
 const h=recordPage({...rec,imagen:'img/sample-page.svg'},{lang:'es',title:'Sample'});
 assert.ok(h.includes('id="viewer"'));assert.ok(h.includes('href="../img/sample-page.svg"'));assert.ok(!h.includes('La imagen original no está disponible'));
});
