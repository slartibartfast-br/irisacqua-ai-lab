import { useState } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const theme = {
  bg: "#0F1923", surface: "#162030", surfaceHover: "#1C2A3A",
  border: "#263545", accent: "#00B4D8", accentGlow: "rgba(0,180,216,0.15)",
  gold: "#FFB703", goldDim: "rgba(255,183,3,0.15)",
  green: "#06D6A0", greenDim: "rgba(6,214,160,0.12)",
  red: "#EF4444", redDim: "rgba(239,68,68,0.12)",
  text: "#E2EAF4", textMuted: "#7B92A8", textDim: "#4A6275", white: "#FFFFFF",
};

const PHASES = [
  { id:1, label:"FASE 1", title:"Scoperta", subtitle:"Sessioni 1–2", icon:"🔍", color:theme.accent, colorDim:theme.accentGlow },
  { id:2, label:"FASE 2", title:"Consapevolezza", subtitle:"Sessioni 3–5", icon:"⚡", color:theme.gold, colorDim:theme.goldDim },
  { id:3, label:"FASE 3", title:"Workflow Agentici", subtitle:"Sessioni 6–7", icon:"🔗", color:theme.green, colorDim:theme.greenDim },
  { id:4, label:"FASE 4", title:"Progettazione Strategica", subtitle:"Sessioni 8–9", icon:"🏗️", color:"#C084FC", colorDim:"rgba(192,132,252,0.12)" },
];

const FUNCTIONAL_AREAS = [
  "Informatica (IT)","Amministrazione","Logistica","Gestione Impianti",
  "Gare e Appalti","Rete Idrica","Sportello Clienti","RPCT / Compliance","HR","Altro"
];

const PHASE1_EXERCISES = [
  { id:"p1a", title:"Il mio primo prompt", desc:"Scrivi un prompt su un problema reale del tuo ufficio.", template:"", hint:"Descrivi un compito che ripeti spesso. Cosa vorresti che l'AI facesse per te?" },
  { id:"p1b", title:"Sintetizza un documento", desc:"Incolla un testo e chiedi un riassunto strutturato.", template:"Analizza il seguente documento:\n1. Sintesi in 3 punti chiave\n2. Azioni richieste\n3. Scadenze\n\nDocumento:\n[TESTO QUI]", hint:"Prova con la Carta dei Servizi o una delibera ARERA." },
  { id:"p1c", title:"Riscrivi una comunicazione", desc:"Trasforma un testo tecnico in linguaggio per il cittadino.", template:"Riscrivi in linguaggio semplice per un cittadino, frasi brevi, tono cordiale:\n\n[TESTO QUI]", hint:"Prova con un avviso di interruzione servizio." },
];


const PHASE2_TESTS = [
  { id:"p2a", title:"Hallucination ARERA", prompt:"Qual è la tariffa media acqua potabile in Italia 2024 secondo ARERA? Fornisci dati numerici precisi.", risk:"Alto — dati inventati", reflection:["I modelli hanno dato dati diversi. Quali accetteresti?","Chi risponde se usi dati AI errati in un documento?","Come cambieresti il prompt per un output più sicuro?"] },
  { id:"p2b", title:"Citazione normativa", prompt:"Secondo il Codice Civile, quali sono gli obblighi del gestore idrico per interruzioni >8h? Cita articoli specifici.", risk:"Molto Alto — norme inesistenti", reflection:["Gli articoli citati esistono davvero?","Quali aree userebbero questo output? Quali rischi?","Come verificheresti prima di usarlo?"] },
  { id:"p2c", title:"Analisi decisionale", prompt:"La nostra utility sta valutando se esternalizzare lo sportello clienti. Dammi una raccomandazione.", risk:"Medio — mancanza contesto aziendale", reflection:["La risposta conosce il contesto di Irisacqua?","Quanto peso daresti senza dati interni?","Dove inizia la tua responsabilità decisionale?"] },
];

const WORKFLOW_TEMPLATES = {
  sportello: { title:"Sportello Clienti", nodes:[
    { id:"n1", type:"input", label:"Richiesta cittadino", desc:"Email/modulo in arrivo", humanRequired:false },
    { id:"n2", type:"agent", label:"Classificazione AI", desc:"Classifica tipo richiesta", humanRequired:false, agentTask:"Classifica in: guasto, fattura, allaccio, reclamo, informazione. Solo la categoria." },
    { id:"n3", type:"human", label:"Verifica urgenza", desc:"Operatore: è urgente?", humanRequired:true },
    { id:"n4", type:"agent", label:"Bozza risposta", desc:"AI genera risposta standard", humanRequired:false, agentTask:"Genera risposta professionale e cordiale per questa richiesta di un cittadino Irisacqua." },
    { id:"n5", type:"human", label:"Revisione e approvazione", desc:"Operatore approva prima dell'invio", humanRequired:true },
    { id:"n6", type:"output", label:"Risposta inviata", desc:"Email o chiusura ticket", humanRequired:false },
  ]},
  procurement: { title:"Gare e Appalti", nodes:[
    { id:"n1", type:"input", label:"Documenti offerta", desc:"PDF offerte ricevute", humanRequired:false },
    { id:"n2", type:"agent", label:"Estrazione dati", desc:"AI estrae prezzi e termini", humanRequired:false, agentTask:"Estrai da questa offerta: prezzo totale, tempi, qualifiche, condizioni particolari." },
    { id:"n3", type:"agent", label:"Confronto criteri", desc:"AI confronta su capitolato", humanRequired:false, agentTask:"Confronta offerte su: prezzo, qualità, tempi, referenze per utility idrica." },
    { id:"n4", type:"human", label:"Valutazione commissione", desc:"Aspetti non automatizzabili", humanRequired:true },
    { id:"n5", type:"agent", label:"Bozza verbale", desc:"AI genera verbale", humanRequired:false, agentTask:"Genera bozza verbale valutazione offerte in formato formale per utility idrica italiana." },
    { id:"n6", type:"human", label:"Approvazione RUP", desc:"RUP firma il verbale", humanRequired:true },
  ]},
};

const GOVERNANCE_QUESTIONS = [
  { id:"q1", label:"Perimetro di autonomia", question:"Dove l'AI decide da sola? Dove DEVE intervenire un umano?", placeholder:"Es: L'AI classifica per richieste standard. Impegni economici richiedono approvazione umana." },
  { id:"q2", label:"Gestione del fallimento", question:"Cosa succede se l'AI sbaglia? Chi se ne accorge? Chi interviene?", placeholder:"Es: Output loggati. Responsabile rivede campioni settimanali. In caso reclamo si ricostruisce la catena." },
  { id:"q3", label:"Dati e privacy", question:"Quali dati entrano? Sono conformi a GDPR e AI Act?", placeholder:"Es: Solo dati anonimizzati. Nessun dato personale a API esterne senza consenso e DPIA." },
  { id:"q4", label:"Misurazione del valore", question:"Come misuri che funziona? KPI concreti.", placeholder:"Es: Tempi risposta da 5gg a 1gg. CSAT. Ore risparmiate/mese." },
  { id:"q5", label:"Sostenibilità organizzativa", question:"Chi mantiene il sistema? Chi lo aggiorna se cambia la normativa?", placeholder:"Es: Referente IT per tecnica. Responsabile area aggiorna contenuti. Revisione semestrale ARERA." },
];


// ─── API ──────────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] }),
  });
  if (!r.ok) throw new Error(`Claude API ${r.status}`);
  return (await r.json()).content?.[0]?.text || "Nessuna risposta";
}

async function callOpenAI(prompt, key) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
    body:JSON.stringify({ model:"gpt-4o-mini", max_tokens:1000, messages:[{role:"user",content:prompt}] }),
  });
  if (!r.ok) throw new Error(`OpenAI API ${r.status}`);
  return (await r.json()).choices?.[0]?.message?.content || "Nessuna risposta";
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Spinner = () => <div style={{ display:"inline-block",width:16,height:16,border:`2px solid ${theme.border}`,borderTopColor:theme.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />;

const Tag = ({ label, color }) => (
  <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",padding:"2px 8px",borderRadius:4,background:`${color}22`,color,border:`1px solid ${color}44`,textTransform:"uppercase" }}>{label}</span>
);

const Card = ({ children, style={}, onClick }) => (
  <div onClick={onClick} style={{ background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:12,padding:20,transition:"all 0.2s",cursor:onClick?"pointer":"default",...style }}
    onMouseEnter={e => onClick&&(e.currentTarget.style.borderColor=theme.accent)}
    onMouseLeave={e => onClick&&(e.currentTarget.style.borderColor=style.borderColor||theme.border)}
  >{children}</div>
);

const Btn = ({ label,onClick,color=theme.accent,disabled,small,outline }) => (
  <button onClick={onClick} disabled={disabled} style={{ padding:small?"6px 14px":"10px 20px",borderRadius:8,fontFamily:"inherit",fontWeight:600,fontSize:small?12:14,cursor:disabled?"not-allowed":"pointer",transition:"all 0.18s",border:outline?`1px solid ${color}`:"none",background:outline?"transparent":color,color:outline?color:theme.bg,opacity:disabled?0.4:1 }}>{label}</button>
);

const TextArea = ({ value,onChange,placeholder,rows=5,disabled }) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} disabled={disabled}
    style={{ width:"100%",background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:8,padding:"12px 14px",color:theme.text,fontFamily:"inherit",fontSize:13,lineHeight:1.6,resize:"vertical",outline:"none",boxSizing:"border-box",opacity:disabled?0.5:1 }}
    onFocus={e=>e.target.style.borderColor=theme.accent} onBlur={e=>e.target.style.borderColor=theme.border}
  />
);


// ─── SETUP ────────────────────────────────────────────────────────────────────
function SetupScreen({ onComplete }) {
  const [name,setName]=useState(""); const [area,setArea]=useState(""); const [openaiKey,setOpenaiKey]=useState(""); const [showKey,setShowKey]=useState(false);
  return (
    <div style={{ minHeight:"100vh",background:theme.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ maxWidth:480,width:"100%",animation:"fadeUp 0.5s ease" }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:12,marginBottom:16 }}>
            <div style={{ width:44,height:44,borderRadius:10,background:`linear-gradient(135deg,${theme.accent},#0066AA)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>💧</div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:18,fontWeight:800,color:theme.white }}>Irisacqua AI Lab</div>
              <div style={{ fontSize:11,color:theme.textMuted,letterSpacing:"0.06em",textTransform:"uppercase" }}>Percorso formativo — 10 sessioni</div>
            </div>
          </div>
          <p style={{ color:theme.textMuted,fontSize:14,lineHeight:1.6,margin:0 }}>Il tuo laboratorio per esplorare, sbagliare, capire e progettare con l'AI.</p>
        </div>
        <Card>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:theme.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em" }}>Il tuo nome</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Es. Marco Rossi"
              style={{ width:"100%",background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:8,padding:"10px 14px",color:theme.text,fontFamily:"inherit",fontSize:14,outline:"none",boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=theme.accent} onBlur={e=>e.target.style.borderColor=theme.border} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:theme.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em" }}>Area funzionale</label>
            <select value={area} onChange={e=>setArea(e.target.value)}
              style={{ width:"100%",background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:8,padding:"10px 14px",color:area?theme.text:theme.textMuted,fontFamily:"inherit",fontSize:14,outline:"none" }}
              onFocus={e=>e.target.style.borderColor=theme.accent} onBlur={e=>e.target.style.borderColor=theme.border}>
              <option value="">Seleziona...</option>
              {FUNCTIONAL_AREAS.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:theme.textMuted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em" }}>
              OpenAI API Key <span style={{ color:theme.textDim,fontWeight:400,textTransform:"none" }}>(opzionale)</span>
            </label>
            <div style={{ position:"relative" }}>
              <input type={showKey?"text":"password"} value={openaiKey} onChange={e=>setOpenaiKey(e.target.value)} placeholder="sk-..."
                style={{ width:"100%",background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:8,padding:"10px 40px 10px 14px",color:theme.text,fontFamily:"monospace",fontSize:13,outline:"none",boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor=theme.accent} onBlur={e=>e.target.style.borderColor=theme.border} />
              <button onClick={()=>setShowKey(!showKey)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:theme.textMuted,cursor:"pointer",fontSize:16 }}>{showKey?"🙈":"👁"}</button>
            </div>
            <div style={{ fontSize:11,color:theme.textDim,marginTop:4 }}>Claude sempre disponibile. OpenAI necessario per la Fase 2.</div>
          </div>
          <Btn label="Inizia il percorso →" onClick={()=>onComplete({name,area,openaiKey})} disabled={!name.trim()||!area} color={theme.accent} />
        </Card>
      </div>
    </div>
  );
}


// ─── PHASE 1 ──────────────────────────────────────────────────────────────────
function Phase1({ user }) {
  const [selectedEx,setSelectedEx]=useState(null); const [prompt,setPrompt]=useState(""); const [response,setResponse]=useState(null);
  const [loading,setLoading]=useState(false); const [coachTip,setCoachTip]=useState(null); const [loadingCoach,setLoadingCoach]=useState(false); const [iteration,setIteration]=useState(0);
  const selectEx=(ex)=>{setSelectedEx(ex);setPrompt(ex.template||"");setResponse(null);setCoachTip(null);setIteration(0);};
  const run=async()=>{setLoading(true);setResponse(null);try{const res=await callClaude(prompt);setResponse(res);setIteration(i=>i+1);}catch(e){setResponse(`Errore: ${e.message}`);}setLoading(false);};
  const getCoach=async()=>{setLoadingCoach(true);try{const res=await callClaude(`Sei coach prompt engineering per responsabile ${user.area} Irisacqua.\nPrompt:\n"${prompt}"\nFeedback (3 punti, italiano, incoraggiante):\n1. Cosa funziona\n2. Cosa manca\n3. Versione migliorata`);setCoachTip(res);}catch(e){setCoachTip(`Errore: ${e.message}`);}setLoadingCoach(false);};
  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13,color:theme.accent,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6 }}>Fase 1 · Scoperta</div>
        <h2 style={{ fontSize:22,fontWeight:800,color:theme.white,margin:"0 0 8px" }}>Il tuo primo contatto con l'AI</h2>
        <p style={{ color:theme.textMuted,fontSize:14,margin:0 }}>Scegli un esercizio, scrivi il tuo prompt, chiedi al coach di migliorarlo.</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24 }}>
        {PHASE1_EXERCISES.map(ex=>(
          <Card key={ex.id} onClick={()=>selectEx(ex)} style={{ borderColor:selectedEx?.id===ex.id?theme.accent:theme.border,background:selectedEx?.id===ex.id?theme.accentGlow:theme.surface }}>
            <div style={{ fontSize:13,fontWeight:700,color:theme.white,marginBottom:4 }}>{ex.title}</div>
            <div style={{ fontSize:12,color:theme.textMuted,lineHeight:1.5 }}>{ex.desc}</div>
          </Card>
        ))}
      </div>
      {selectedEx&&<div style={{ animation:"fadeUp 0.3s ease" }}>
        <div style={{ background:theme.goldDim,border:`1px solid ${theme.gold}44`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:theme.gold }}>💡 <strong>Suggerimento:</strong> {selectedEx.hint}</div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12,fontWeight:600,color:theme.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em" }}>Il tuo prompt {iteration>0&&<span style={{ color:theme.green }}>· iterazione {iteration}</span>}</div>
          <TextArea value={prompt} onChange={setPrompt} placeholder="Scrivi il tuo prompt..." rows={6} />
        </div>
        <div style={{ display:"flex",gap:10,marginBottom:24 }}>
          <Btn label={loading?"Elaborazione...":"▶ Esegui con Claude"} onClick={run} disabled={loading||!prompt.trim()} color={theme.accent} />
          <Btn label={loadingCoach?"Analisi...":"🎓 Chiedi al coach"} onClick={getCoach} disabled={loadingCoach||!prompt.trim()} color={theme.gold} outline />
        </div>
        {coachTip&&<Card style={{ background:theme.goldDim,borderColor:`${theme.gold}44`,marginBottom:20,animation:"fadeUp 0.3s ease" }}>
          <div style={{ fontSize:12,fontWeight:700,color:theme.gold,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em" }}>🎓 Feedback del Coach</div>
          <div style={{ fontSize:13,color:theme.text,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{coachTip}</div>
        </Card>}
        {(loading||response)&&<Card style={{ animation:"fadeUp 0.3s ease" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
            <Tag label="Claude" color="#C084FC" /><span style={{ fontSize:12,color:theme.textMuted }}>risposta</span>
            {iteration>1&&<span style={{ fontSize:11,color:theme.green }}>· prompt migliorato ✓</span>}
          </div>
          {loading?<div style={{ display:"flex",alignItems:"center",gap:10,color:theme.textMuted,fontSize:13 }}><Spinner /> Generazione...</div>
            :<div style={{ fontSize:13,color:theme.text,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{response}</div>}
        </Card>}
        {response&&<div style={{ marginTop:20,padding:"14px 16px",background:theme.greenDim,border:`1px solid ${theme.green}44`,borderRadius:8,fontSize:13,color:theme.green }}><strong>Rifletti:</strong> Questo output è utile? Cosa cambieresti nel prompt?</div>}
      </div>}
    </div>
  );
}


// ─── PHASE 2 ──────────────────────────────────────────────────────────────────
function Phase2({ user }) {
  const [selectedTest,setSelectedTest]=useState(null); const [customPrompt,setCustomPrompt]=useState(""); const [results,setResults]=useState({});
  const [loading,setLoading]=useState({}); const [reflectionAnswers,setReflectionAnswers]=useState({}); const [showReflection,setShowReflection]=useState(false);
  const hasOpenAI=user.openaiKey?.startsWith("sk-"); const activePrompt=selectedTest?selectedTest.prompt:customPrompt;
  const runAll=async()=>{
    if(!activePrompt.trim())return; setResults({}); setShowReflection(false); setReflectionAnswers({});
    setLoading({claude:true,...(hasOpenAI?{openai:true}:{})});
    const runModel=async(model)=>{try{const res=model==="claude"?await callClaude(activePrompt):await callOpenAI(activePrompt,user.openaiKey);setResults(r=>({...r,[model]:res}));}catch(e){setResults(r=>({...r,[model]:`⚠️ ${e.message}`}));}setLoading(l=>({...l,[model]:false}));};
    runModel("claude"); if(hasOpenAI)runModel("openai");
  };
  const bothDone=results.claude&&(hasOpenAI?results.openai:true);
  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13,color:theme.gold,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6 }}>Fase 2 · Consapevolezza</div>
        <h2 style={{ fontSize:22,fontWeight:800,color:theme.white,margin:"0 0 8px" }}>Dove l'AI sbaglia — e chi ne risponde</h2>
        <p style={{ color:theme.textMuted,fontSize:14,margin:0 }}>Stress test comparativi. Scopri i limiti e le domande di governance che ne seguono.</p>
      </div>
      <div style={{ background:theme.redDim,border:`1px solid ${theme.red}44`,borderRadius:8,padding:"10px 14px",marginBottom:20,fontSize:13,color:theme.red }}>
        ⚠️ <strong>Attenzione:</strong> questi esercizi mostrano i limiti dell'AI. Aspettati errori, dati inventati, norme inesistenti.
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16 }}>
        {PHASE2_TESTS.map(t=>(
          <Card key={t.id} onClick={()=>{setSelectedTest(t);setResults({});setShowReflection(false);}} style={{ borderColor:selectedTest?.id===t.id?theme.gold:theme.border,background:selectedTest?.id===t.id?theme.goldDim:theme.surface }}>
            <div style={{ fontSize:12,fontWeight:700,color:theme.white,marginBottom:4 }}>{t.title}</div>
            <div style={{ fontSize:11,color:theme.red }}>Rischio: {t.risk}</div>
          </Card>
        ))}
      </div>
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontSize:12,fontWeight:700,color:theme.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em" }}>Oppure scrivi il tuo prompt</div>
        <TextArea value={customPrompt} onChange={v=>{setCustomPrompt(v);setSelectedTest(null);}} placeholder="Inserisci un prompt da testare su più modelli..." rows={3} />
      </Card>
      {activePrompt&&<div style={{ background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:8,padding:"12px 14px",marginBottom:16,fontSize:13,color:theme.textMuted,fontStyle:"italic" }}><strong style={{ color:theme.text,fontStyle:"normal" }}>Prompt attivo:</strong> {activePrompt}</div>}
      <div style={{ display:"flex",gap:10,marginBottom:24 }}>
        <Btn label="▶ Esegui su tutti i modelli" onClick={runAll} disabled={!activePrompt.trim()} color={theme.gold} />
        {!hasOpenAI&&<span style={{ fontSize:12,color:theme.textDim,alignSelf:"center" }}>⚠️ Aggiungi OpenAI key nel setup per il confronto</span>}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:hasOpenAI?"1fr 1fr":"1fr",gap:16,marginBottom:20 }}>
        {["claude",...(hasOpenAI?["openai"]:[])].map(model=>(
          <div key={model}>
            <div style={{ marginBottom:8 }}><Tag label={model==="claude"?"Claude":"GPT-4o"} color={model==="claude"?"#C084FC":"#10A37F"} /></div>
            <Card style={{ minHeight:120 }}>
              {loading[model]?<div style={{ display:"flex",alignItems:"center",gap:8,color:theme.textMuted,fontSize:13 }}><Spinner /> Elaborazione...</div>
                :results[model]?<div style={{ fontSize:13,color:theme.text,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{results[model]}</div>
                :<div style={{ color:theme.textDim,fontSize:13 }}>In attesa...</div>}
            </Card>
          </div>
        ))}
      </div>
      {bothDone&&<div style={{ animation:"fadeUp 0.3s ease" }}>
        <Btn label={showReflection?"Nascondi":"🤔 Domande di governance"} onClick={()=>setShowReflection(!showReflection)} color={theme.gold} outline small />
        {showReflection&&selectedTest&&<Card style={{ background:theme.goldDim,borderColor:`${theme.gold}44`,marginTop:16,animation:"fadeUp 0.3s ease" }}>
          <div style={{ fontSize:13,fontWeight:700,color:theme.gold,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.06em" }}>🤔 Fermati. Rispondi.</div>
          {selectedTest.reflection.map((q,i)=>(
            <div key={i} style={{ marginBottom:16 }}>
              <div style={{ fontSize:13,color:theme.text,fontWeight:600,marginBottom:6 }}>{i+1}. {q}</div>
              <TextArea value={reflectionAnswers[i]||""} onChange={v=>setReflectionAnswers(a=>({...a,[i]:v}))} placeholder="La tua risposta..." rows={2} />
            </div>
          ))}
        </Card>}
      </div>}
    </div>
  );
}


// ─── PHASE 3 ──────────────────────────────────────────────────────────────────
function Phase3({ user }) {
  const [template,setTemplate]=useState("sportello"); const [nodes,setNodes]=useState(WORKFLOW_TEMPLATES.sportello.nodes);
  const [outputs,setOutputs]=useState({}); const [nodeLoading,setNodeLoading]=useState({});
  const [testInput,setTestInput]=useState("Buongiorno, vorrei info sulla mia bolletta di gennaio che sembra errata. Ho pagato 45€ ma il mese scorso era 22€.");
  const [running,setRunning]=useState(false);
  const changeTemplate=(key)=>{setTemplate(key);setNodes(WORKFLOW_TEMPLATES[key].nodes);setOutputs({});};
  const runWorkflow=async()=>{
    setRunning(true);setOutputs({});let prev=testInput;
    for(const node of nodes){
      if(node.agentTask){setNodeLoading(l=>({...l,[node.id]:true}));
        try{const res=await callClaude(`${node.agentTask}\n\nInput: ${prev}`);setOutputs(o=>({...o,[node.id]:res}));prev=res;}
        catch(e){setOutputs(o=>({...o,[node.id]:`Errore: ${e.message}`}));}
        setNodeLoading(l=>({...l,[node.id]:false}));await new Promise(r=>setTimeout(r,300));
      }else if(node.humanRequired){setOutputs(o=>({...o,[node.id]:"⏸️ In attesa approvazione umana"}));await new Promise(r=>setTimeout(r,400));}
    }
    setRunning(false);
  };
  const nodeIcon=t=>({input:"📥",agent:"🤖",decision:"🔀",human:"👤",output:"📤"}[t]||"⬜");
  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13,color:theme.green,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6 }}>Fase 3 · Workflow Agentici</div>
        <h2 style={{ fontSize:22,fontWeight:800,color:theme.white,margin:"0 0 8px" }}>Costruisci una catena di agenti</h2>
        <p style={{ color:theme.textMuted,fontSize:14,margin:0 }}>I nodi gialli richiedono un umano. Esegui su un input reale.</p>
      </div>
      <div style={{ display:"flex",gap:10,marginBottom:20 }}>
        {Object.entries(WORKFLOW_TEMPLATES).map(([key,t])=><Btn key={key} label={t.title} onClick={()=>changeTemplate(key)} color={theme.green} outline={template!==key} small />)}
      </div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12,fontWeight:600,color:theme.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em" }}>Input di test</div>
        <TextArea value={testInput} onChange={setTestInput} rows={3} />
      </div>
      <div style={{ marginBottom:24 }}><Btn label={running?"⏳ In esecuzione...":"▶ Esegui tutto il workflow"} onClick={runWorkflow} disabled={running} color={theme.green} /></div>
      <div style={{ display:"flex",flexDirection:"column",gap:4,marginBottom:24 }}>
        {nodes.map((node,i)=>(
          <div key={node.id}>
            <div style={{ background:node.humanRequired?theme.goldDim:theme.surface,border:`${node.humanRequired?2:1}px solid ${node.humanRequired?theme.gold:theme.border}`,borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12 }}>
              <div style={{ fontSize:20,lineHeight:1 }}>{nodeIcon(node.type)}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:2 }}>
                  <span style={{ fontSize:13,fontWeight:700,color:theme.white }}>{node.label}</span>
                  {node.humanRequired&&<Tag label="Intervento umano" color={theme.gold} />}
                  {outputs[node.id]&&!outputs[node.id].startsWith("⏸️")&&<Tag label="✓ ok" color={theme.green} />}
                  {nodeLoading[node.id]&&<Spinner />}
                </div>
                <div style={{ fontSize:12,color:theme.textMuted }}>{node.desc}</div>
              </div>
            </div>
            {outputs[node.id]&&<div style={{ marginLeft:20,padding:"10px 14px",background:theme.bg,border:`1px solid ${theme.border}`,borderLeft:`3px solid ${theme.green}`,fontSize:12,color:theme.textMuted,lineHeight:1.6 }}>{outputs[node.id]}</div>}
            {i<nodes.length-1&&<div style={{ display:"flex",justifyContent:"center",padding:"2px 0" }}><div style={{ width:2,height:16,background:theme.border }} /></div>}
          </div>
        ))}
      </div>
      <Card style={{ background:"rgba(192,132,252,0.08)",borderColor:"rgba(192,132,252,0.3)" }}>
        <div style={{ fontSize:12,fontWeight:700,color:"#C084FC",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em" }}>🏛️ Osservazione di governance</div>
        <div style={{ fontSize:13,color:theme.text,lineHeight:1.7 }}>I nodi gialli sono dove un umano interviene. Non è un limite tecnico — è una <strong style={{ color:theme.white }}>scelta di governance</strong>. Chi decide dove mettere questi checkpoint? Questi sono i confini del perimetro di esecuzione.</div>
      </Card>
    </div>
  );
}


// ─── PHASE 4 ──────────────────────────────────────────────────────────────────
function Phase4({ user }) {
  const [title,setTitle]=useState(""); const [scope,setScope]=useState(""); const [answers,setAnswers]=useState({});
  const [aiExample,setAiExample]=useState(null); const [loadingEx,setLoadingEx]=useState(null); const [score,setScore]=useState(null);
  const completed=Object.values(answers).filter(a=>a?.trim().length>20).length;
  const getExample=async(q)=>{setLoadingEx(q.id);try{const res=await callClaude(`Consulente AI governance utility idrica. Responsabile ${user.area} Irisacqua progetta: "${title||"progetto AI"}". Per: "${q.question}" — esempio concreto 2-3 frasi, conforme GDPR AI Act ARERA.`);setAiExample({id:q.id,text:res});}catch(e){setAiExample({id:q.id,text:`Errore: ${e.message}`});}setLoadingEx(null);};
  const calcScore=()=>{const depth=Object.values(answers).reduce((acc,a)=>acc+(a?.length>100?4:a?.length>50?2:0),0);setScore({completeness:Math.round((completed/GOVERNANCE_QUESTIONS.length)*100),hasTitle:title.trim().length>5,hasScope:scope.trim().length>30,depth});};
  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13,color:"#C084FC",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6 }}>Fase 4 · Progettazione Strategica</div>
        <h2 style={{ fontSize:22,fontWeight:800,color:theme.white,margin:"0 0 8px" }}>Il tuo progetto AI per Irisacqua</h2>
        <p style={{ color:theme.textMuted,fontSize:14,margin:0 }}>5 domande di governance. Il test di maturità prima della direzione.</p>
      </div>
      <Card style={{ marginBottom:24 }}>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block",fontSize:12,fontWeight:600,color:theme.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em" }}>Nome del progetto</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={`Es. Gestione intelligente reclami ${user.area}`}
            style={{ width:"100%",background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:8,padding:"10px 14px",color:theme.text,fontFamily:"inherit",fontSize:15,fontWeight:600,outline:"none",boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor="#C084FC"} onBlur={e=>e.target.style.borderColor=theme.border} />
        </div>
        <div>
          <label style={{ display:"block",fontSize:12,fontWeight:600,color:theme.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em" }}>Descrizione in una riga</label>
          <TextArea value={scope} onChange={setScope} placeholder="Cosa fa? Per chi? Quale problema risolve?" rows={2} />
        </div>
      </Card>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:theme.textMuted,marginBottom:6 }}><span>Domande completate</span><span style={{ color:completed===GOVERNANCE_QUESTIONS.length?theme.green:theme.textMuted }}>{completed}/{GOVERNANCE_QUESTIONS.length}</span></div>
        <div style={{ height:4,background:theme.border,borderRadius:2 }}><div style={{ height:"100%",width:`${(completed/GOVERNANCE_QUESTIONS.length)*100}%`,background:`linear-gradient(90deg,#C084FC,${theme.green})`,borderRadius:2,transition:"width 0.4s ease" }} /></div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:16,marginBottom:24 }}>
        {GOVERNANCE_QUESTIONS.map((q,i)=>(
          <Card key={q.id} style={{ borderColor:answers[q.id]?.trim().length>20?"#C084FC44":theme.border }}>
            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10,gap:12 }}>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                  <div style={{ width:22,height:22,borderRadius:"50%",background:answers[q.id]?.trim().length>20?"#C084FC22":theme.bg,border:`1px solid ${answers[q.id]?.trim().length>20?"#C084FC":theme.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#C084FC" }}>{i+1}</div>
                  <span style={{ fontSize:12,fontWeight:700,color:"#C084FC",textTransform:"uppercase",letterSpacing:"0.06em" }}>{q.label}</span>
                </div>
                <div style={{ fontSize:14,color:theme.white,fontWeight:600 }}>{q.question}</div>
              </div>
              <Btn label={loadingEx===q.id?"...":"💡 Esempio AI"} onClick={()=>getExample(q)} disabled={loadingEx===q.id||!title.trim()} small color="#C084FC" outline />
            </div>
            <TextArea value={answers[q.id]||""} onChange={v=>setAnswers(a=>({...a,[q.id]:v}))} placeholder={q.placeholder} rows={3} />
            {aiExample?.id===q.id&&<div style={{ marginTop:10,padding:"10px 12px",background:"rgba(192,132,252,0.08)",border:"1px solid rgba(192,132,252,0.3)",borderRadius:8,fontSize:12,color:theme.textMuted,lineHeight:1.6 }}><strong style={{ color:"#C084FC" }}>Esempio:</strong> {aiExample.text}</div>}
          </Card>
        ))}
      </div>
      <Btn label="📊 Valuta la maturità del progetto" onClick={calcScore} disabled={!title.trim()} color="#C084FC" />
      {score&&<Card style={{ marginTop:20,background:"rgba(192,132,252,0.08)",borderColor:"rgba(192,132,252,0.3)",animation:"fadeUp 0.3s ease" }}>
        <div style={{ fontSize:13,fontWeight:700,color:"#C084FC",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.06em" }}>📊 Valutazione di maturità</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {[
            {label:"Copertura governance",val:`${score.completeness}%`,color:score.completeness===100?theme.green:theme.gold},
            {label:"Titolo e scope",val:(score.hasTitle&&score.hasScope)?"✓ Definiti":"⚠️ Incompleto",color:(score.hasTitle&&score.hasScope)?theme.green:theme.gold},
            {label:"Profondità risposte",val:score.depth>15?"Alta":score.depth>8?"Media":"Da approfondire",color:score.depth>15?theme.green:score.depth>8?theme.gold:theme.red},
            {label:"Pronto per la direzione",val:(score.completeness===100&&score.hasTitle&&score.hasScope&&score.depth>8)?"✓ Sì":"Non ancora",color:(score.completeness===100&&score.hasTitle&&score.hasScope&&score.depth>8)?theme.green:theme.red},
          ].map(item=>(
            <div key={item.label} style={{ background:theme.bg,borderRadius:8,padding:"10px 12px" }}>
              <div style={{ fontSize:11,color:theme.textMuted,marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15,fontWeight:700,color:item.color }}>{item.val}</div>
            </div>
          ))}
        </div>
      </Card>}
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null); const [activePhase,setActivePhase]=useState(1);
  if(!user) return <SetupScreen onComplete={setUser} />;
  const phase=PHASES.find(p=>p.id===activePhase);
  return (
    <div style={{ minHeight:"100vh",background:theme.bg,fontFamily:"'Inter',system-ui,sans-serif",color:theme.text }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box} ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:#263545;border-radius:3px} input::placeholder,textarea::placeholder{color:#4A6275} select option{background:#162030}`}</style>
      <div style={{ position:"fixed",left:0,top:0,bottom:0,width:220,background:theme.surface,borderRight:`1px solid ${theme.border}`,display:"flex",flexDirection:"column",padding:"20px 0",zIndex:10 }}>
        <div style={{ padding:"0 16px 20px",borderBottom:`1px solid ${theme.border}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${theme.accent},#0066AA)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>💧</div>
            <div><div style={{ fontSize:13,fontWeight:800,color:theme.white,lineHeight:1 }}>AI Lab</div><div style={{ fontSize:10,color:theme.textMuted }}>Irisacqua</div></div>
          </div>
          <div style={{ fontSize:11,color:theme.textDim }}><span style={{ color:theme.accent }}>●</span> {user.name}</div>
          <div style={{ fontSize:10,color:theme.textDim,marginTop:2 }}>{user.area}</div>
        </div>
        <div style={{ flex:1,padding:"12px 0",overflowY:"auto" }}>
          {PHASES.map(p=>(
            <div key={p.id} onClick={()=>setActivePhase(p.id)} style={{ padding:"10px 16px",cursor:"pointer",transition:"all 0.15s",background:activePhase===p.id?p.colorDim:"transparent",borderLeft:activePhase===p.id?`3px solid ${p.color}`:"3px solid transparent" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:16 }}>{p.icon}</span>
                <div>
                  <div style={{ fontSize:10,fontWeight:700,color:activePhase===p.id?p.color:theme.textDim,textTransform:"uppercase",letterSpacing:"0.06em" }}>{p.label}</div>
                  <div style={{ fontSize:12,fontWeight:600,color:activePhase===p.id?theme.white:theme.textMuted }}>{p.title}</div>
                  <div style={{ fontSize:10,color:theme.textDim }}>{p.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:"12px 16px",borderTop:`1px solid ${theme.border}` }}>
          <div style={{ fontSize:10,color:theme.textDim }}>Powered by Claude{user.openaiKey?.startsWith("sk-")&&" · OpenAI active"}</div>
        </div>
      </div>
      <div style={{ marginLeft:220,padding:"32px 36px",maxWidth:900 }}>
        <div style={{ marginBottom:28,paddingBottom:20,borderBottom:`1px solid ${theme.border}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:40,height:40,borderRadius:10,background:phase.colorDim,border:`1px solid ${phase.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{phase.icon}</div>
            <div>
              <div style={{ fontSize:11,color:phase.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em" }}>{phase.label} · {phase.subtitle}</div>
              <div style={{ fontSize:18,fontWeight:800,color:theme.white }}>{phase.title}</div>
            </div>
          </div>
        </div>
        {activePhase===1&&<Phase1 user={user} />}
        {activePhase===2&&<Phase2 user={user} />}
        {activePhase===3&&<Phase3 user={user} />}
        {activePhase===4&&<Phase4 user={user} />}
      </div>
    </div>
  );
}
