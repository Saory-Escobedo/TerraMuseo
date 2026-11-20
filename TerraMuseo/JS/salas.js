/* Interacciones compartidas para las salas 02 y 03 */
document.addEventListener('DOMContentLoaded', () => {
  const viewer=document.getElementById('panoramaViewer'), panorama=document.getElementById('panoramaImage');
  if(viewer && panorama){
    let dragging=false,startX=0,offset=-22,startOffset=-22;
    const moveTo=value=>{offset=Math.max(-48,Math.min(0,value));panorama.style.transform=`translateX(${offset}%)`;};
    viewer.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;startOffset=offset;viewer.setPointerCapture(e.pointerId);});
    viewer.addEventListener('pointermove',e=>{if(dragging)moveTo(startOffset+((e.clientX-startX)/viewer.clientWidth)*48);});
    viewer.addEventListener('pointerup',()=>dragging=false);viewer.addEventListener('pointercancel',()=>dragging=false);
    document.getElementById('panLeft').addEventListener('click',()=>moveTo(offset+8));
    document.getElementById('panRight').addEventListener('click',()=>moveTo(offset-8));
    document.getElementById('panReset').addEventListener('click',()=>moveTo(-22));
  }
  const data=window.TERRA_ROOM;
  if(!data)return;
  document.querySelectorAll('.artifact-card').forEach(button=>button.addEventListener('click',()=>{
    const item=data.artifacts[Number(button.dataset.artifact)];
    document.getElementById('artifactTitle').textContent=item.title;
    document.getElementById('artifactDescription').textContent=item.description;
    document.getElementById('artifactFact').textContent=item.fact;
    document.getElementById('artifactDetail').hidden=false;
    document.getElementById('artifactDetail').scrollIntoView({behavior:'smooth',block:'nearest'});
  }));
  document.getElementById('closeArtifact').addEventListener('click',()=>document.getElementById('artifactDetail').hidden=true);

  const board=document.getElementById('memoryBoard'),movesEl=document.getElementById('memoryMoves'),pairsEl=document.getElementById('memoryPairs'),message=document.getElementById('memoryMessage');
  let first=null,second=null,locked=false,moves=0,matched=0;
  const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function resetTurn(){first=null;second=null;locked=false;}
  function flip(card){
    if(locked||card===first||card.classList.contains('is-matched'))return;
    card.classList.add('is-flipped');
    if(!first){first=card;return;}
    second=card;moves++;movesEl.textContent=moves;
    if(first.dataset.pair===second.dataset.pair){
      first.classList.add('is-matched');second.classList.add('is-matched');first.disabled=true;second.disabled=true;matched++;
      pairsEl.textContent=`${matched} / ${data.pairs.length}`;message.textContent='¡Pareja encontrada! Sigue así.';resetTurn();
      if(matched===data.pairs.length)message.textContent=`¡Memorama completado en ${moves} movimientos! 🏆`;
    }else{
      locked=true;message.textContent='No coinciden. ¡Intenta otra vez!';
      window.setTimeout(()=>{first.classList.remove('is-flipped');second.classList.remove('is-flipped');resetTurn();},900);
    }
  }
  function renderBoard(){
    board.innerHTML='';
    const cards=[];
    data.pairs.forEach(pair=>{
      ['image','text'].forEach(type=>{
        const card=document.createElement('button');card.type='button';card.className='memory-card';card.dataset.pair=pair.id;
        const front=document.createElement('span');front.className='card-front';front.textContent='?';
        const back=document.createElement('span');back.className='card-back';
        if(type==='image'){const img=document.createElement('img');img.src=pair.image;img.alt=pair.name;back.appendChild(img);}
        else{const symbol=document.createElement('strong');symbol.textContent='✦';const label=document.createElement('span');label.textContent=pair.name;back.append(symbol,label);}
        card.append(front,back);card.addEventListener('click',()=>flip(card));cards.push(card);
      });
    });
    shuffle(cards).forEach(card=>board.appendChild(card));
  }
  function restart(){first=null;second=null;locked=false;moves=0;matched=0;movesEl.textContent='0';pairsEl.textContent=`0 / ${data.pairs.length}`;message.textContent='¡Encuentra las seis parejas!';renderBoard();}
  document.getElementById('restartMemory').addEventListener('click',restart);restart();

  let index=0,score=0,answered=false;
  const options=document.getElementById('quizOptions'),feedback=document.getElementById('quizFeedback'),next=document.getElementById('nextQuestion'),question=document.getElementById('quizQuestion'),result=document.getElementById('quizResult');
  function renderQuestion(){
    answered=false;const item=data.questions[index];
    document.getElementById('quizCount').textContent=`${index+1} / ${data.questions.length}`;
    document.getElementById('quizProgress').style.width=`${(index+1)/data.questions.length*100}%`;
    question.textContent=item.q;document.getElementById('quizScore').textContent=score;
    feedback.textContent='';options.innerHTML='';next.disabled=true;next.hidden=false;
    item.a.forEach((answer,i)=>{const button=document.createElement('button');button.type='button';button.className='quiz-option';button.textContent=answer;button.addEventListener('click',()=>choose(i,button));options.appendChild(button);});
    next.textContent=index===data.questions.length-1?'Ver resultado ★':'Siguiente →';
  }
  function choose(choice,selected){
    if(answered)return;answered=true;const item=data.questions[index];
    [...options.querySelectorAll('button')].forEach((button,i)=>{button.disabled=true;if(i===item.c)button.classList.add('correct');});
    if(choice===item.c){score++;feedback.textContent='🎉 ¡Correcto! '+item.why;}
    else{selected.classList.add('incorrect');feedback.textContent='Buen intento. '+item.why;}
    document.getElementById('quizScore').textContent=score;next.disabled=false;
  }
  function showResult(){
    question.textContent='¡Terminaste el test!';options.innerHTML='';feedback.textContent='';next.hidden=true;document.getElementById('quizCount').textContent='Finalizado';
    result.hidden=false;result.innerHTML=`<div class="display-4">${score>=4?'🏆':score>=3?'🌟':'📚'}</div><h3>Obtuviste ${score} de ${data.questions.length}</h3><p>${Math.round(score/data.questions.length*100)}% de respuestas correctas. ${score>=4?'¡Eres un gran explorador del arte!':'¡Puedes volver a recorrer la sala y probar otra vez!'}</p><button class="btn btn-terra" id="retryQuiz" type="button">Volver a intentarlo</button>`;
    document.getElementById('retryQuiz').addEventListener('click',()=>{index=0;score=0;result.hidden=true;renderQuestion();});
  }
  next.addEventListener('click',()=>{if(!answered)return;if(index<data.questions.length-1){index++;renderQuestion();}else showResult();});
  renderQuestion();
});