const $=id=>document.getElementById(id);
const parameters=new URLSearchParams(location.search);
if(parameters.get('embedded')==='1'){const id=parameters.get('productId')||'1000083';$('preview').src='/embed?productId='+encodeURIComponent(id);}
function inspect(){const doc=$('preview').contentDocument;if(!doc)return;const width=doc.documentElement.clientWidth,overflow=doc.documentElement.scrollWidth>width;
  $('result').textContent=`${width} px · ${overflow?'Horizontaler Überlauf gefunden':'Kein horizontaler Überlauf'}`;}
function resize(){const width=Number($('width').value),height=width<760?844:950,scale=Math.min(1,(window.innerWidth-40)/(width+12));
  $('preview').style.width=`${width}px`;$('preview').style.height=`${height}px`;$('device').style.width=`${width}px`;
  $('device').style.transform=`scale(${scale})`;$('holder').style.width=`${(width+12)*scale}px`;$('holder').style.height=`${(height+12)*scale}px`;requestAnimationFrame(inspect);}
$('preview').addEventListener('load',()=>{const doc=$('preview').contentDocument;doc.documentElement.classList.add('embedded');resize();});
$('width').addEventListener('change',resize);$('inspect').addEventListener('click',inspect);window.addEventListener('resize',resize);resize();

