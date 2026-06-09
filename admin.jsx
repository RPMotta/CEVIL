import { useState, useEffect } from "react";

const SUPA_URL = "https://hnpahosgldgecwgobizb.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhucGFob3NnbGRnZWN3Z29iaXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTg3MzksImV4cCI6MjA5NjU3NDczOX0.Ux4xGVVshJpOZ0vn10YZ6seeia_m4TjwTboiKTXVkdM";

async function supa(path, opts = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1${path}`, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer ?? "return=representation",
      ...opts.headers,
    },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

function hashSimple(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16).padStart(8, "0");
}

// ─── Paleta idêntica ao site público ───────────────────────────────────────
const C = {
  azulEscuro: "#1a3a5c",
  azulMedio:  "#1e5fa8",
  azulClaro:  "#3182ce",
  dourado:    "#c8992a",
  douradoClaro:"#e8b84b",
  cinzaEscuro:"#333333",
  cinzaMedio: "#666666",
  cinzaClaro: "#f5f5f5",
  branco:     "#ffffff",
  verde:      "#2d8a4e",
  vermelho:   "#c0392b",
};

// ─── Perfis de acesso ──────────────────────────────────────────────────────
// super_admin : acesso total — todas as telas, pode editar/excluir tudo
// tesouraria  : acessa Tesouraria + visualização/pesquisa (sem editar cadastros)
// visualizador: visualiza e pesquisa tudo, EXCETO Tesouraria; não pode editar/excluir

function usePerfil(user) {
  const p = user?.perfil || "";
  return {
    isSuperAdmin : p === "super_admin",
    isTesouraria : p === "tesouraria",
    isVisualizador: p === "visualizador",
    // helpers de permissão
    podeEditar    : p === "super_admin",                        // criar/editar/excluir cadastros
    podeTesouraria: p === "super_admin" || p === "tesouraria",  // ver módulo financeiro
    podeUsuarios  : p === "super_admin",                        // gerenciar usuários
    podeProjetos  : p === "super_admin",                        // criar/editar projetos
    podeConfigs   : p === "super_admin",                        // ver configurações
    labelPerfil   : p === "super_admin" ? "Super Admin"
                  : p === "tesouraria"  ? "Tesouraria"
                  : "Visualizador",
    corPerfil     : p === "super_admin" ? "#7c4dbb"
                  : p === "tesouraria"  ? "#c8992a"
                  : "#1e5fa8",
  };
}

const NAV_ITEMS = [
  { id:"dashboard",        label:"Dashboard",        icon:"⊞", section:"PRINCIPAL",  perfis:["super_admin","tesouraria","visualizador"] },
  { id:"novo-cadastro",    label:"Novo Cadastro",     icon:"＋", section:null,         perfis:["super_admin"] },
  { id:"pessoas",          label:"Pessoas",           icon:"●", section:null,         perfis:["super_admin","visualizador"] },
  { id:"registrar-visita", label:"Registrar Visita",  icon:"✎", section:null,         perfis:["super_admin"] },
  { id:"relatorios",       label:"Relatórios",        icon:"▦", section:null,         perfis:["super_admin","visualizador"] },
  { id:"tesouraria",       label:"Tesouraria",        icon:"💰", section:null,         perfis:["super_admin","tesouraria"] },
  { id:"minha-conta",      label:"Minha Conta",       icon:"🔑", section:"SISTEMA",    perfis:["super_admin","tesouraria","visualizador"] },
  { id:"projetos",         label:"Projetos",          icon:"📋", section:null,         perfis:["super_admin"] },
  { id:"usuarios",         label:"Usuários",          icon:"🔒", section:null,         perfis:["super_admin"] },
  { id:"configuracoes",    label:"Configurações",     icon:"⚙", section:null,         perfis:["super_admin"] },
];

// ─── Componentes base ───────────────────────────────────────────────────────

function Btn({ children, onClick, color, outline, small, full, disabled, style={} }) {
  const bg  = color ?? C.dourado;
  const bgF = outline ? "transparent" : bg;
  const txt = outline ? bg : C.branco;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:bgF, color:txt, border:`2px solid ${bg}`,
      borderRadius:5, padding: small?"5px 14px":"10px 24px",
      fontSize: small?12:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer",
      opacity:disabled?.6:1, width:full?"100%":undefined,
      textTransform:"uppercase", letterSpacing:".5px",
      display:"inline-flex", alignItems:"center", gap:6,
      transition:"all .25s", ...style,
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, placeholder, type="text", required, readOnly }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label && <label style={{fontSize:12,fontWeight:600,color:C.cinzaEscuro}}>{label}{required&&<span style={{color:C.vermelho}}> *</span>}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
        style={{border:`1.5px solid #ddd`,borderRadius:5,padding:"10px 12px",fontSize:13,
          background:readOnly?C.cinzaClaro:C.branco,color:C.cinzaEscuro,outline:"none",
          width:"100%",boxSizing:"border-box",fontFamily:"inherit"}} />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label && <label style={{fontSize:12,fontWeight:600,color:C.cinzaEscuro}}>{label}{required&&<span style={{color:C.vermelho}}> *</span>}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{border:`1.5px solid #ddd`,borderRadius:5,padding:"10px 12px",fontSize:13,
          background:C.branco,color:C.cinzaEscuro,outline:"none",width:"100%",cursor:"pointer",fontFamily:"inherit"}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows=4 }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label&&<label style={{fontSize:12,fontWeight:600,color:C.cinzaEscuro}}>{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{border:`1.5px solid #ddd`,borderRadius:5,padding:"10px 12px",fontSize:13,
          background:C.branco,color:C.cinzaEscuro,outline:"none",resize:"vertical",
          fontFamily:"inherit",width:"100%",boxSizing:"border-box"}} />
    </div>
  );
}

function Card({ children, style={} }) {
  return <div style={{background:C.branco,border:`1px solid #e8e8e8`,borderRadius:10,padding:"24px 28px",...style}}>{children}</div>;
}

function SecaoTitulo({ icon, children }) {
  return (
    <div style={{marginBottom:20}}>
      <p style={{fontSize:11,textTransform:"uppercase",letterSpacing:"2px",color:C.dourado,fontWeight:700,marginBottom:6}}>{icon} {children}</p>
      <div style={{width:40,height:3,background:C.dourado,borderRadius:2}} />
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{position:"fixed",top:20,right:20,background:type==="error"?C.vermelho:C.verde,
      color:C.branco,padding:"12px 22px",borderRadius:7,fontSize:13,fontWeight:700,
      zIndex:9999,boxShadow:"0 4px 16px rgba(0,0,0,.25)"}}>
      {msg}
    </div>
  );
}

function useToast() {
  const [t,setT] = useState(null);
  const show = (msg, type="ok") => { setT({msg,type}); setTimeout(()=>setT(null),3000); };
  return [t, show];
}

// ─── LOGIN ──────────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [usuario,setUsuario] = useState("");
  const [senha,setSenha]     = useState("");
  const [loading,setLoading] = useState(false);
  const [erro,setErro]       = useState("");

  async function handleLogin() {
    if (!usuario||!senha){setErro("Preencha usuário e senha.");return;}
    setLoading(true);setErro("");
    try {
      const hash = hashSimple(senha);
      const rows = await supa(`/sistema_usuarios?usuario=eq.${encodeURIComponent(usuario)}&senha_hash=eq.${hash}&ativo=eq.true&select=*`);
      if (!rows?.length){setErro("Usuário ou senha inválidos.");return;}
      onLogin(rows[0]);
    } catch(e){setErro("Erro ao conectar com o servidor.");}
    finally{setLoading(false);}
  }

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.azulEscuro},${C.azulMedio})`,
      display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Open Sans',sans-serif"}}>

      {/* Barra top decorativa */}
      <div style={{position:"fixed",top:0,left:0,right:0,background:"rgba(0,0,0,.25)",
        padding:"10px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{fontFamily:"'Merriweather',serif",color:C.branco,fontWeight:700,fontSize:16}}>Associação CEVIL</span>
          <span style={{fontSize:10,color:C.douradoClaro,textTransform:"uppercase",letterSpacing:"1px",marginLeft:10}}>Casa de Esperança Viveiro de Luz</span>
        </div>
        <a href="index.html" style={{color:"rgba(255,255,255,.7)",fontSize:12}}>← Voltar ao site</a>
      </div>

      <div style={{background:C.branco,borderRadius:12,padding:"44px 48px",width:400,
        boxShadow:"0 12px 50px rgba(0,0,0,.35)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:C.azulEscuro,
            display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:14}}>🌿</div>
          <div style={{fontFamily:"'Merriweather',serif",fontWeight:700,fontSize:20,color:C.azulEscuro}}>Área Administrativa</div>
          <div style={{fontSize:11,color:C.dourado,textTransform:"uppercase",letterSpacing:"1px",marginTop:4}}>Associação CEVIL</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="Usuário" value={usuario} onChange={setUsuario} placeholder="seu.usuario" />
          <Input label="Senha" value={senha} onChange={setSenha} placeholder="••••••" type="password" />
          {erro && <div style={{color:C.vermelho,fontSize:12,background:"#fef0f0",border:"1px solid #f5c6c6",borderRadius:6,padding:"8px 12px"}}>{erro}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{background:C.dourado,color:C.branco,border:"none",borderRadius:5,padding:"13px",
              fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",
              textTransform:"uppercase",letterSpacing:".5px",marginTop:4,
              opacity:loading?.7:1}}>
            {loading?"Entrando...":"Entrar"}
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:20}}>
          <a href="index.html" style={{fontSize:12,color:C.azulMedio}}>← Voltar ao site público</a>
        </div>
      </div>
    </div>
  );
}

// ─── LAYOUT ─────────────────────────────────────────────────────────────────

function Layout({ user, page, setPage, onLogout, children }) {
  const { labelPerfil, corPerfil } = usePerfil(user);

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.cinzaClaro,fontFamily:"'Open Sans',sans-serif"}}>

      {/* Sidebar */}
      <aside style={{width:200,background:C.azulEscuro,display:"flex",flexDirection:"column",flexShrink:0,
        boxShadow:"4px 0 20px rgba(0,0,0,.18)"}}>

        {/* Logo */}
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,.1)",
              border:"1px solid rgba(255,255,255,.2)",display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:18}}>🌿</div>
            <div>
              <div style={{fontFamily:"'Merriweather',serif",fontWeight:700,fontSize:14,color:C.branco}}>CEVIL</div>
              <div style={{fontSize:9,color:C.douradoClaro,textTransform:"uppercase",letterSpacing:"1px"}}>Administração</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"8px 0",overflowY:"auto"}}>
          {NAV_ITEMS.filter(n => n.perfis.includes(user.perfil)).map((item,i,arr) => {
            const prev = arr[i-1];
            return (
              <div key={item.id}>
                {item.section && item.section !== prev?.section && (
                  <div style={{padding:"14px 16px 4px",fontSize:9,fontWeight:700,
                    color:"rgba(255,255,255,.35)",letterSpacing:".1em"}}>{item.section}</div>
                )}
                <button onClick={()=>setPage(item.id)}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 16px",
                    background: page===item.id?"rgba(255,255,255,.12)":"transparent",
                    border:"none",borderLeft:`3px solid ${page===item.id?C.dourado:"transparent"}`,
                    color: page===item.id?C.branco:"rgba(255,255,255,.65)",
                    fontSize:13,fontWeight:page===item.id?700:400,cursor:"pointer",textAlign:"left",
                    transition:"all .2s"}}>
                  <span style={{fontSize:14,minWidth:18}}>{item.icon}</span>
                  {item.label}
                </button>
              </div>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.1)"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:2,textTransform:"uppercase",letterSpacing:".5px"}}>Logado como</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.8)",fontWeight:600,lineHeight:1.4}}>{user.nome_completo}</div>
        </div>
      </aside>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Topbar — idêntica ao site público */}
        <header style={{background:C.azulEscuro,display:"flex",alignItems:"center",
          justifyContent:"space-between",padding:"0 24px",height:50,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:16,fontSize:12,color:"rgba(255,255,255,.65)"}}>
            <span>🕐 Segunda a Sexta – 08h às 17h</span>
            <span>📍 Rua Graciosa 227 – Palhoça, SC</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{background:corPerfil,color:C.branco,fontSize:11,fontWeight:700,
              padding:"3px 12px",borderRadius:20,textTransform:"uppercase"}}>
              {labelPerfil}
            </span>
            <a href="index.html" style={{color:"rgba(255,255,255,.65)",fontSize:12,padding:"4px 10px"}}>← Site</a>
            <button onClick={onLogout}
              style={{background:"transparent",border:"1px solid rgba(255,255,255,.35)",
                color:C.branco,padding:"4px 14px",borderRadius:20,fontSize:12,cursor:"pointer"}}>
              Sair
            </button>
          </div>
        </header>

        <main style={{flex:1,padding:28,overflowY:"auto"}}>{children}</main>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div style={{marginBottom:28}}>
      <h1 style={{fontSize:26,fontWeight:700,color:C.azulEscuro,fontFamily:"'Merriweather',serif",margin:0}}>{title}</h1>
      {subtitle && <p style={{fontSize:13,color:C.cinzaMedio,margin:"5px 0 0"}}>{subtitle}</p>}
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────

function Dashboard({ setPage }) {
  const [stats,setStats]       = useState({pessoas:0,visitas:0,visitasMes:0,projetos:0});
  const [porProjeto,setPP]     = useState([]);
  const [ultimas,setUltimas]   = useState([]);
  const [porMes,setPorMes]     = useState([]);

  useEffect(()=>{
    async function load(){
      try {
        const [pRows,vRows,prRows] = await Promise.all([
          supa("/pessoas?select=id"),
          supa("/visitas?select=id,data_visita,projeto,observacoes,pessoas(nome_completo)"),
          supa("/projetos?status=eq.ativo&select=id,nome"),
        ]);
        const now = new Date();
        const mesK = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
        setStats({pessoas:(pRows||[]).length,visitas:(vRows||[]).length,
          visitasMes:(vRows||[]).filter(v=>v.data_visita?.startsWith(mesK)).length,
          projetos:(prRows||[]).length});
        const pp={};
        (vRows||[]).forEach(v=>{pp[v.projeto]=(pp[v.projeto]||0)+1;});
        setPP(Object.entries(pp).map(([n,c])=>({nome:n,count:c})).sort((a,b)=>b.count-a.count).slice(0,5));
        setUltimas([...(vRows||[])].sort((a,b)=>new Date(b.data_visita)-new Date(a.data_visita)).slice(0,6));
        const meses=[];
        for(let i=5;i>=0;i--){
          const d=new Date(now.getFullYear(),now.getMonth()-i,1);
          const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
          const label=d.toLocaleDateString("pt-BR",{month:"short",year:"2-digit"}).replace(". ","/");
          meses.push({key,label,count:(vRows||[]).filter(v=>v.data_visita?.startsWith(key)).length});
        }
        setPorMes(meses);
      } catch(_){}
    }
    load();
  },[]);

  const maxMes = Math.max(...porMes.map(m=>m.count),1);
  const cards = [
    {label:"PESSOAS",    value:stats.pessoas,    color:C.azulMedio},
    {label:"TOTAL VISITAS", value:stats.visitas,  color:"#e07020"},
    {label:"VISITAS MÊS",   value:stats.visitasMes,color:C.azulClaro},
    {label:"PROJETOS ATIVOS",value:stats.projetos,color:"#7c4dbb"},
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral da associação" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        {cards.map(s=>(
          <div key={s.label} style={{background:C.branco,borderLeft:`4px solid ${s.color}`,
            borderRadius:10,padding:"20px 20px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
            <div style={{fontSize:34,fontWeight:700,color:C.azulEscuro,fontFamily:"'Merriweather',serif"}}>{s.value}</div>
            <div style={{fontSize:10,fontWeight:700,color:C.cinzaMedio,letterSpacing:".07em",marginTop:4,textTransform:"uppercase"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
        <Card>
          <SecaoTitulo icon="📊">Visitas por Projeto</SecaoTitulo>
          {porProjeto.length===0
            ? <p style={{color:C.cinzaMedio,fontSize:13}}>Sem dados.</p>
            : porProjeto.map(p=>(
              <div key={p.nome} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{flex:1,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nome}</div>
                <div style={{width:110,height:7,background:C.cinzaClaro,borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:`${Math.round((p.count/(stats.visitas||1))*100)}%`,height:"100%",background:C.azulMedio,borderRadius:4}} />
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.azulMedio,minWidth:18}}>{p.count}</div>
              </div>
            ))}
        </Card>
        <Card>
          <SecaoTitulo icon="📈">Visitas — Últimos 6 Meses</SecaoTitulo>
          {porMes.map(m=>(
            <div key={m.key} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{fontSize:12,color:C.cinzaMedio,minWidth:48}}>{m.label}</div>
              <div style={{flex:1,height:7,background:C.cinzaClaro,borderRadius:4,overflow:"hidden"}}>
                <div style={{width:`${Math.round((m.count/maxMes)*100)}%`,height:"100%",background:C.azulMedio,borderRadius:4}} />
              </div>
              <div style={{fontSize:13,fontWeight:700,color:C.dourado,minWidth:16}}>{m.count}</div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <SecaoTitulo icon="⏱">Últimas Visitas</SecaoTitulo>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:C.azulEscuro}}>
              {["PESSOA","PROJETO","DATA","OBSERVAÇÃO"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",color:C.branco,fontWeight:700,fontSize:11,letterSpacing:".06em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ultimas.length===0
              ? <tr><td colSpan={4} style={{padding:"16px 14px",color:C.cinzaMedio,textAlign:"center"}}>Nenhuma visita registrada.</td></tr>
              : ultimas.map((v,i)=>(
                <tr key={v.id} style={{background:i%2===0?C.branco:C.cinzaClaro}}>
                  <td style={{padding:"9px 14px"}}>{v.pessoas?.nome_completo||"—"}</td>
                  <td style={{padding:"9px 14px"}}>{v.projeto}</td>
                  <td style={{padding:"9px 14px",whiteSpace:"nowrap"}}>{v.data_visita?new Date(v.data_visita+"T12:00:00").toLocaleDateString("pt-BR"):"—"}</td>
                  <td style={{padding:"9px 14px",color:C.cinzaMedio}}>{v.observacoes||"—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── NOVO CADASTRO ───────────────────────────────────────────────────────────

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function NovoCadastro({ onSaved }) {
  const empty = {nome_completo:"",cpf:"",data_nascimento:"",cep:"",numero:"",rua:"",complemento:"",bairro:"",cidade:"",estado:"",telefone:"",email:"",emerg_nome:"",emerg_telefone:"",projeto:"",data_visita:"",observacoes:""};
  const [f,setF] = useState(empty);
  const [projetos,setProjetos] = useState([]);
  const [loading,setLoading]   = useState(false);
  const [toast,showToast]      = useToast();
  const set = k => v => setF(p=>({...p,[k]:v}));

  useEffect(()=>{ supa("/projetos?status=eq.ativo&select=id,nome").then(r=>setProjetos(r||[])).catch(()=>{}); },[]);

  async function buscarCep(cep) {
    const c = cep.replace(/\D/g,"");
    if(c.length!==8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
      const d = await r.json();
      if(d.erro) return;
      setF(p=>({...p,rua:d.logradouro||"",bairro:d.bairro||"",cidade:d.localidade||"",estado:d.uf||""}));
    } catch(_){}
  }

  async function salvar() {
    if(!f.nome_completo||!f.cpf||!f.projeto||!f.data_visita){showToast("Preencha os campos obrigatórios.","error");return;}
    setLoading(true);
    try {
      const pessoa = await supa("/pessoas",{method:"POST",body:JSON.stringify({
        nome_completo:f.nome_completo,cpf:f.cpf.replace(/\D/g,""),data_nascimento:f.data_nascimento||null,
        cep:f.cep,rua:f.rua,numero:f.numero,complemento:f.complemento,bairro:f.bairro,cidade:f.cidade,estado:f.estado,
        telefone:f.telefone,email:f.email,emerg_nome:f.emerg_nome,emerg_telefone:f.emerg_telefone,
      })});
      await supa("/visitas",{method:"POST",body:JSON.stringify({
        pessoa_id:pessoa[0].id,projeto:f.projeto,data_visita:f.data_visita,observacoes:f.observacoes||null,
      })});
      showToast("Cadastro salvo com sucesso!");
      setF(empty);
      setTimeout(()=>onSaved?.(),1200);
    } catch(e){
      showToast(e.message.includes("unique")?"CPF já cadastrado.":"Erro: "+e.message,"error");
    } finally{setLoading(false);}
  }

  const Row2 = ({children}) => <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{children}</div>;

  return (
    <div>
      <Toast {...(toast||{})} />
      <PageHeader title="Novo Cadastro" subtitle="Registre uma nova pessoa" />

      <Card style={{marginBottom:20}}>
        <SecaoTitulo icon="👤">Dados Pessoais</SecaoTitulo>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="Nome Completo" value={f.nome_completo} onChange={set("nome_completo")} placeholder="Ex: Maria Aparecida da Silva" required />
          <Row2>
            <Input label="CPF" value={f.cpf} onChange={set("cpf")} placeholder="000.000.000-00" required />
            <Input label="Data de Nascimento" value={f.data_nascimento} onChange={set("data_nascimento")} type="date" />
          </Row2>
        </div>
      </Card>

      <Card style={{marginBottom:20}}>
        <SecaoTitulo icon="📍">Endereço</SecaoTitulo>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 110px",gap:10,alignItems:"end"}}>
            <Input label="CEP" value={f.cep} onChange={v=>{set("cep")(v);if(v.replace(/\D/g,"").length===8)buscarCep(v);}} placeholder="00000-000" />
            <Btn onClick={()=>buscarCep(f.cep)} style={{height:40}}>🔍</Btn>
            <Input label="Número" value={f.numero} onChange={set("numero")} placeholder="123" required />
          </div>
          <Input label="Rua / Logradouro" value={f.rua} onChange={set("rua")} placeholder="Preenchido pelo CEP" required />
          <Row2>
            <Input label="Complemento" value={f.complemento} onChange={set("complemento")} placeholder="Apto, Bloco..." />
            <Input label="Bairro" value={f.bairro} onChange={set("bairro")} placeholder="Preenchido pelo CEP" required />
          </Row2>
          <Row2>
            <Input label="Cidade" value={f.cidade} onChange={set("cidade")} placeholder="Preenchido pelo CEP" required />
            <Select label="Estado" value={f.estado} onChange={set("estado")} required
              options={[{value:"",label:"Selecione..."},...ESTADOS.map(e=>({value:e,label:e}))]} />
          </Row2>
        </div>
      </Card>

      <Card style={{marginBottom:20}}>
        <SecaoTitulo icon="📞">Contato</SecaoTitulo>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Row2>
            <Input label="Telefone / WhatsApp" value={f.telefone} onChange={set("telefone")} placeholder="(48) 99999-9999" />
            <Input label="E-mail" value={f.email} onChange={set("email")} placeholder="email@exemplo.com" type="email" />
          </Row2>
          <Row2>
            <Input label="Nome — Emergência" value={f.emerg_nome} onChange={set("emerg_nome")} placeholder="Ex: João Silva" />
            <Input label="Tel — Emergência" value={f.emerg_telefone} onChange={set("emerg_telefone")} placeholder="(48) 98888-8888" />
          </Row2>
        </div>
      </Card>

      <Card style={{marginBottom:24}}>
        <SecaoTitulo icon="🗓">Primeira Visita</SecaoTitulo>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Row2>
            <Select label="Projeto" value={f.projeto} onChange={set("projeto")} required
              options={[{value:"",label:"Selecione..."},...projetos.map(p=>({value:p.nome,label:p.nome}))]} />
            <Input label="Data da Visita" value={f.data_visita} onChange={set("data_visita")} type="date" required />
          </Row2>
          <Textarea label="Observações" value={f.observacoes} onChange={set("observacoes")} placeholder="Informações adicionais..." />
        </div>
      </Card>

      <Btn onClick={salvar} disabled={loading} color="#e07020">👤 {loading?"Salvando...":"Salvar Cadastro"}</Btn>
    </div>
  );
}

// ─── PESSOAS ────────────────────────────────────────────────────────────────

function Pessoas({ setPage, setPessoaId, user }) {
  const [nome,setNome]       = useState("");
  const [projeto,setProjeto] = useState("");
  const [cidade,setCidade]   = useState("");
  const [results,setResults] = useState(null);
  const [projetos,setProjetos] = useState([]);
  const [loading,setLoading] = useState(false);
  const [toast,showToast]    = useToast();

  useEffect(()=>{ supa("/projetos?status=eq.ativo&select=id,nome").then(r=>setProjetos(r||[])).catch(()=>{}); },[]);

  async function buscar() {
    setLoading(true);
    try {
      let q="/pessoas?select=id,nome_completo,cpf,cidade,estado,telefone&order=nome_completo.asc&limit=100";
      if(nome) q+=`&or=(nome_completo.ilike.*${nome}*,cpf.ilike.*${nome.replace(/\D/g,"")}*)`;
      if(cidade) q+=`&cidade=ilike.*${cidade}*`;
      const rows = await supa(q);
      if(projeto){
        const vr = await supa(`/visitas?projeto=eq.${encodeURIComponent(projeto)}&select=pessoa_id`);
        const ids = new Set((vr||[]).map(v=>v.pessoa_id));
        setResults((rows||[]).filter(p=>ids.has(p.id)));
      } else setResults(rows||[]);
    } catch(e){showToast("Erro na busca.","error");}
    finally{setLoading(false);}
  }

  async function excluir(id) {
    if(!confirm("Excluir esta pessoa e todas as visitas?")) return;
    try {
      await supa(`/visitas?pessoa_id=eq.${id}`,{method:"DELETE",prefer:""});
      await supa(`/pessoas?id=eq.${id}`,{method:"DELETE",prefer:""});
      showToast("Excluído.");
      setResults(r=>r.filter(p=>p.id!==id));
    } catch(e){showToast("Erro ao excluir.","error");}
  }

  return (
    <div>
      <Toast {...(toast||{})} />
      <PageHeader title="Pessoas" subtitle="Busque e gerencie os cadastros" />
      <Card style={{marginBottom:20}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1.5fr auto",gap:12,alignItems:"end"}}>
          <Input label="Nome ou CPF" value={nome} onChange={setNome} placeholder="Buscar..." />
          <Select label="Projeto" value={projeto} onChange={setProjeto}
            options={[{value:"",label:"Todos"},...projetos.map(p=>({value:p.nome,label:p.nome}))]} />
          <Input label="Cidade" value={cidade} onChange={setCidade} placeholder="Cidade..." />
          <Btn onClick={buscar} disabled={loading} color={C.azulMedio}>🔍 Buscar</Btn>
        </div>
      </Card>

      {results===null
        ? <div style={{textAlign:"center",padding:"60px 0",color:C.cinzaMedio}}>
            <div style={{fontSize:40,marginBottom:8}}>🔍</div>
            <div>Use os filtros para buscar.</div>
          </div>
        : results.length===0
          ? <div style={{textAlign:"center",padding:"60px 0",color:C.cinzaMedio}}>Nenhuma pessoa encontrada.</div>
          : <Card>
              <div style={{fontSize:13,color:C.cinzaMedio,marginBottom:12}}>{results.length} resultado(s)</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:C.azulEscuro}}>
                    {["Nome","CPF","Cidade/UF","Telefone","Ações"].map(h=>(
                      <th key={h} style={{padding:"10px 12px",textAlign:"left",color:C.branco,fontWeight:700,fontSize:11,letterSpacing:".06em"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((p,i)=>(
                    <tr key={p.id} style={{background:i%2===0?C.branco:C.cinzaClaro}}>
                      <td style={{padding:"9px 12px",fontWeight:600}}>{p.nome_completo}</td>
                      <td style={{padding:"9px 12px",color:C.cinzaMedio}}>{p.cpf}</td>
                      <td style={{padding:"9px 12px"}}>{[p.cidade,p.estado].filter(Boolean).join("/")||"—"}</td>
                      <td style={{padding:"9px 12px"}}>{p.telefone||"—"}</td>
                      <td style={{padding:"9px 12px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <Btn small outline color={C.azulMedio} onClick={()=>{setPessoaId(p.id);setPage("perfil-pessoa");}}>Ver</Btn>
                          {usePerfil(user).podeEditar && (
                            <Btn small outline color={C.vermelho} onClick={()=>excluir(p.id)}>Excluir</Btn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
      }
    </div>
  );
}

// ─── PERFIL PESSOA ───────────────────────────────────────────────────────────

function PerfilPessoa({ pessoaId, setPage, user }) {
  const [pessoa,setPessoa]   = useState(null);
  const [visitas,setVisitas] = useState([]);
  const [projetos,setProjetos] = useState([]);
  const [nova,setNova]       = useState({projeto:"",data_visita:"",observacoes:""});
  const [loading,setLoading] = useState(false);
  const [toast,showToast]    = useToast();

  useEffect(()=>{
    if(!pessoaId) return;
    Promise.all([
      supa(`/pessoas?id=eq.${pessoaId}&select=*`),
      supa(`/visitas?pessoa_id=eq.${pessoaId}&select=*&order=data_visita.desc`),
      supa("/projetos?status=eq.ativo&select=id,nome"),
    ]).then(([p,v,pr])=>{ setPessoa(p?.[0]||null); setVisitas(v||[]); setProjetos(pr||[]); }).catch(()=>{});
  },[pessoaId]);

  async function adicionarVisita() {
    if(!nova.projeto||!nova.data_visita){showToast("Projeto e data obrigatórios.","error");return;}
    setLoading(true);
    try {
      await supa("/visitas",{method:"POST",body:JSON.stringify({pessoa_id:pessoaId,...nova})});
      const v = await supa(`/visitas?pessoa_id=eq.${pessoaId}&select=*&order=data_visita.desc`);
      setVisitas(v||[]);
      setNova({projeto:"",data_visita:"",observacoes:""});
      showToast("Visita registrada!");
    } catch(e){showToast("Erro.","error");}finally{setLoading(false);}
  }

  if(!pessoa) return <div style={{color:C.cinzaMedio,padding:40}}>Carregando...</div>;

  return (
    <div>
      <Toast {...(toast||{})} />
      <div style={{marginBottom:16}}><Btn small outline color={C.cinzaMedio} onClick={()=>setPage("pessoas")}>← Voltar</Btn></div>
      <PageHeader title={pessoa.nome_completo} subtitle={`CPF: ${pessoa.cpf}`} />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
        <Card>
          <SecaoTitulo icon="📍">Endereço</SecaoTitulo>
          <p style={{fontSize:13,lineHeight:1.8,color:C.cinzaEscuro,margin:0}}>
            {pessoa.rua&&<>{pessoa.rua}, {pessoa.numero}<br/></>}
            {pessoa.complemento&&<>{pessoa.complemento}<br/></>}
            {pessoa.bairro&&<>{pessoa.bairro}<br/></>}
            {pessoa.cidade&&<>{pessoa.cidade} – {pessoa.estado}</>}
          </p>
        </Card>
        <Card>
          <SecaoTitulo icon="📞">Contato</SecaoTitulo>
          <div style={{fontSize:13,lineHeight:2}}>
            {pessoa.telefone&&<div>📱 {pessoa.telefone}</div>}
            {pessoa.email&&<div>✉️ {pessoa.email}</div>}
            {pessoa.emerg_nome&&<div>🚨 {pessoa.emerg_nome} — {pessoa.emerg_telefone}</div>}
          </div>
        </Card>
      </div>
      {usePerfil(user).podeEditar && (
      <Card style={{marginBottom:20}}>
        <SecaoTitulo icon="➕">Registrar Nova Visita</SecaoTitulo>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <Select label="Projeto" value={nova.projeto} onChange={v=>setNova(p=>({...p,projeto:v}))} required
            options={[{value:"",label:"Selecione..."},...projetos.map(p=>({value:p.nome,label:p.nome}))]} />
          <Input label="Data" value={nova.data_visita} onChange={v=>setNova(p=>({...p,data_visita:v}))} type="date" required />
        </div>
        <Textarea label="Observações" value={nova.observacoes} onChange={v=>setNova(p=>({...p,observacoes:v}))} placeholder="..." rows={2} />
        <div style={{marginTop:14}}><Btn onClick={adicionarVisita} disabled={loading} small>+ Adicionar Visita</Btn></div>
      </Card>
      )}
      <Card>
        <SecaoTitulo icon="📋">Histórico de Visitas ({visitas.length})</SecaoTitulo>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:C.azulEscuro}}>
              {["Data","Projeto","Observação"].map(h=>(
                <th key={h} style={{padding:"9px 12px",textAlign:"left",color:C.branco,fontWeight:700,fontSize:11}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visitas.length===0
              ? <tr><td colSpan={3} style={{padding:16,color:C.cinzaMedio,textAlign:"center"}}>Nenhuma visita.</td></tr>
              : visitas.map((v,i)=>(
                <tr key={v.id} style={{background:i%2===0?C.branco:C.cinzaClaro}}>
                  <td style={{padding:"8px 12px",whiteSpace:"nowrap"}}>{v.data_visita?new Date(v.data_visita+"T12:00:00").toLocaleDateString("pt-BR"):"—"}</td>
                  <td style={{padding:"8px 12px"}}>{v.projeto}</td>
                  <td style={{padding:"8px 12px",color:C.cinzaMedio}}>{v.observacoes||"—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── REGISTRAR VISITA ────────────────────────────────────────────────────────

function RegistrarVisita() {
  const [busca,setBusca]     = useState("");
  const [pessoa,setPessoa]   = useState(null);
  const [projetos,setProjetos] = useState([]);
  const [form,setForm]       = useState({projeto:"",data_visita:new Date().toISOString().split("T")[0],observacoes:""});
  const [loading,setLoading] = useState(false);
  const [toast,showToast]    = useToast();

  useEffect(()=>{ supa("/projetos?status=eq.ativo&select=id,nome").then(r=>setProjetos(r||[])).catch(()=>{}); },[]);

  async function buscarPessoa() {
    if(!busca.trim()) return;
    const q = busca.replace(/\D/g,"").length>8
      ? `/pessoas?cpf=eq.${busca.replace(/\D/g,"")}&select=*`
      : `/pessoas?nome_completo=ilike.*${busca}*&select=*&limit=5`;
    try {
      const r = await supa(q);
      if(!r?.length){showToast("Nenhuma pessoa encontrada.","error");setPessoa(null);return;}
      setPessoa(r[0]);
    } catch(e){showToast("Erro.","error");}
  }

  async function registrar() {
    if(!pessoa||!form.projeto||!form.data_visita){showToast("Preencha todos os campos.","error");return;}
    setLoading(true);
    try {
      await supa("/visitas",{method:"POST",body:JSON.stringify({pessoa_id:pessoa.id,...form})});
      showToast("Visita registrada!");
      setForm({projeto:"",data_visita:new Date().toISOString().split("T")[0],observacoes:""});
      setPessoa(null);setBusca("");
    } catch(e){showToast("Erro.","error");}finally{setLoading(false);}
  }

  return (
    <div>
      <Toast {...(toast||{})} />
      <PageHeader title="Registrar Visita" subtitle="Adicione uma visita a uma pessoa cadastrada" />
      <Card style={{marginBottom:20}}>
        <SecaoTitulo icon="🔍">Buscar Pessoa</SecaoTitulo>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"end"}}>
          <Input label="Nome ou CPF" value={busca} onChange={setBusca} placeholder="Digite o nome ou CPF..." />
          <Btn onClick={buscarPessoa} color={C.azulMedio}>🔍 Buscar</Btn>
        </div>
      </Card>
      {pessoa && (
        <Card>
          <div style={{background:"#e8f4ec",border:`1px solid ${C.verde}40`,borderRadius:8,padding:"12px 16px",marginBottom:20}}>
            <div style={{fontWeight:700,color:C.verde}}>{pessoa.nome_completo}</div>
            <div style={{fontSize:12,color:C.cinzaMedio}}>CPF: {pessoa.cpf} · {[pessoa.cidade,pessoa.estado].filter(Boolean).join("/")||""}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <Select label="Projeto" value={form.projeto} onChange={v=>setForm(p=>({...p,projeto:v}))} required
              options={[{value:"",label:"Selecione..."},...projetos.map(p=>({value:p.nome,label:p.nome}))]} />
            <Input label="Data" value={form.data_visita} onChange={v=>setForm(p=>({...p,data_visita:v}))} type="date" required />
          </div>
          <Textarea label="Observações" value={form.observacoes} onChange={v=>setForm(p=>({...p,observacoes:v}))} placeholder="..." rows={3} />
          <div style={{marginTop:16}}><Btn onClick={registrar} disabled={loading} color={C.verde}>✅ {loading?"Registrando...":"Registrar Visita"}</Btn></div>
        </Card>
      )}
    </div>
  );
}

// ─── RELATÓRIOS ──────────────────────────────────────────────────────────────

function Relatorios() {
  const [filtros,setFiltros] = useState({nome:"",projeto:"",dataInicio:"",dataFim:""});
  const [projetos,setProjetos] = useState([]);
  const [rows,setRows]       = useState(null);
  const [loading,setLoading] = useState(false);
  const [toast,showToast]    = useToast();
  const setF = k => v => setFiltros(p=>({...p,[k]:v}));

  useEffect(()=>{ supa("/projetos?status=eq.ativo&select=id,nome").then(r=>setProjetos(r||[])).catch(()=>{}); },[]);

  async function gerar() {
    setLoading(true);
    try {
      let q="/visitas?select=id,data_visita,projeto,observacoes,pessoas(nome_completo,cpf,cidade,estado,telefone)&order=data_visita.desc&limit=500";
      if(filtros.projeto) q+=`&projeto=eq.${encodeURIComponent(filtros.projeto)}`;
      if(filtros.dataInicio) q+=`&data_visita=gte.${filtros.dataInicio}`;
      if(filtros.dataFim)    q+=`&data_visita=lte.${filtros.dataFim}`;
      let r = await supa(q);
      if(filtros.nome){
        const n=filtros.nome.toLowerCase();
        r=r.filter(v=>v.pessoas?.nome_completo?.toLowerCase().includes(n)||v.pessoas?.cpf?.includes(n));
      }
      setRows(r||[]);
    } catch(e){showToast("Erro.","error");}finally{setLoading(false);}
  }

  function exportarCSV() {
    if(!rows?.length) return;
    const h="Nome,CPF,Cidade,UF,Telefone,Projeto,Data,Observação\n";
    const l=rows.map(v=>[v.pessoas?.nome_completo,v.pessoas?.cpf,v.pessoas?.cidade,v.pessoas?.estado,v.pessoas?.telefone,v.projeto,v.data_visita,v.observacoes].map(c=>`"${(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob(["\ufeff"+h+l],{type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`cevil_relatorio_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  return (
    <div>
      <Toast {...(toast||{})} />
      <PageHeader title="Relatórios" subtitle="Filtre e exporte dados" />
      <Card style={{marginBottom:20}}>
        <SecaoTitulo icon="🔑">Filtros</SecaoTitulo>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Input label="Nome ou CPF" value={filtros.nome} onChange={setF("nome")} placeholder="Buscar..." />
          <Select label="Projeto" value={filtros.projeto} onChange={setF("projeto")}
            options={[{value:"",label:"Todos"},...projetos.map(p=>({value:p.nome,label:p.nome}))]} />
          <Input label="Data Início" value={filtros.dataInicio} onChange={setF("dataInicio")} type="date" />
          <Input label="Data Fim"    value={filtros.dataFim}    onChange={setF("dataFim")}    type="date" />
        </div>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <Btn onClick={gerar} disabled={loading} color={C.azulEscuro}>▦ {loading?"Gerando...":"Gerar Relatório"}</Btn>
          {rows?.length>0 && <Btn onClick={exportarCSV} outline color={C.azulEscuro}>⬇ Exportar CSV</Btn>}
        </div>
      </Card>
      {rows!==null && (
        <Card>
          <div style={{fontSize:13,color:C.cinzaMedio,marginBottom:12}}>{rows.length} registro(s)</div>
          {rows.length===0
            ? <div style={{textAlign:"center",color:C.cinzaMedio,padding:"40px 0"}}>Nenhum resultado.</div>
            : <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:C.azulEscuro}}>
                    {["Nome","CPF","Cidade","Tel","Projeto","Data","Obs."].map(h=>(
                      <th key={h} style={{padding:"9px 10px",textAlign:"left",color:C.branco,fontWeight:700,fontSize:11}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((v,i)=>(
                    <tr key={v.id} style={{background:i%2===0?C.branco:C.cinzaClaro}}>
                      <td style={{padding:"7px 10px"}}>{v.pessoas?.nome_completo}</td>
                      <td style={{padding:"7px 10px",color:C.cinzaMedio}}>{v.pessoas?.cpf}</td>
                      <td style={{padding:"7px 10px"}}>{[v.pessoas?.cidade,v.pessoas?.estado].filter(Boolean).join("/")}</td>
                      <td style={{padding:"7px 10px"}}>{v.pessoas?.telefone||"—"}</td>
                      <td style={{padding:"7px 10px"}}>{v.projeto}</td>
                      <td style={{padding:"7px 10px",whiteSpace:"nowrap"}}>{v.data_visita?new Date(v.data_visita+"T12:00:00").toLocaleDateString("pt-BR"):"—"}</td>
                      <td style={{padding:"7px 10px",color:C.cinzaMedio}}>{v.observacoes||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </Card>
      )}
    </div>
  );
}

// ─── TESOURARIA ──────────────────────────────────────────────────────────────

function Tesouraria() {
  const emptyLanc = {descricao:"",tipo:"entrada",valor:"",data:"",categoria:"",projeto:"",observacoes:""};
  const [lancamentos,setLancamentos] = useState([]);
  const [projetos,setProjetos]       = useState([]);
  const [form,setForm]               = useState(emptyLanc);
  const [filtros,setFiltros]         = useState({tipo:"",projeto:"",dataInicio:"",dataFim:""});
  const [aba,setAba]                 = useState("lancamentos");
  const [loading,setLoading]         = useState(false);
  const [toast,showToast]            = useToast();
  const setF = k=>v=>setForm(p=>({...p,[k]:v}));
  const setFil = k=>v=>setFiltros(p=>({...p,[k]:v}));

  const CATEGORIAS_ENT = ["Doação","Convênio","Projeto","Evento","Patrocínio","Outros"];
  const CATEGORIAS_SAI = ["Alimentação","Material","Pessoal","Aluguel","Transporte","Serviços","Manutenção","Eventos","Outros"];

  async function loadLanc() {
    try {
      let q="/financeiro?select=*&order=data.desc&limit=200";
      if(filtros.tipo)       q+=`&tipo=eq.${filtros.tipo}`;
      if(filtros.projeto)    q+=`&projeto=eq.${encodeURIComponent(filtros.projeto)}`;
      if(filtros.dataInicio) q+=`&data=gte.${filtros.dataInicio}`;
      if(filtros.dataFim)    q+=`&data=lte.${filtros.dataFim}`;
      const r = await supa(q);
      setLancamentos(r||[]);
    } catch(_){}
  }

  useEffect(()=>{
    supa("/projetos?status=eq.ativo&select=id,nome").then(r=>setProjetos(r||[])).catch(()=>{});
    loadLanc();
  },[]);

  async function salvarLanc() {
    if(!form.descricao||!form.valor||!form.data||!form.categoria){showToast("Preencha os campos obrigatórios.","error");return;}
    const valorNum = parseFloat(form.valor.replace(",","."));
    if(isNaN(valorNum)||valorNum<=0){showToast("Valor inválido.","error");return;}
    setLoading(true);
    try {
      await supa("/financeiro",{method:"POST",body:JSON.stringify({
        descricao:form.descricao,tipo:form.tipo,valor:valorNum,data:form.data,
        categoria:form.categoria,projeto:form.projeto||null,observacoes:form.observacoes||null,
      })});
      showToast(form.tipo==="entrada"?"Entrada registrada!":"Saída registrada!");
      setForm(emptyLanc);
      loadLanc();
    } catch(e){showToast("Erro: "+e.message,"error");}finally{setLoading(false);}
  }

  async function excluirLanc(id) {
    if(!confirm("Excluir este lançamento?")) return;
    try {
      await supa(`/financeiro?id=eq.${id}`,{method:"DELETE",prefer:""});
      showToast("Excluído.");
      setLancamentos(l=>l.filter(x=>x.id!==id));
    } catch(e){showToast("Erro.","error");}
  }

  function exportarCSV() {
    if(!lancamentos.length) return;
    const h="Data,Tipo,Categoria,Descrição,Projeto,Valor,Observações\n";
    const l=lancamentos.map(v=>[v.data,v.tipo,v.categoria,v.descricao,v.projeto||"",
      v.valor.toFixed(2).replace(".",","),v.observacoes||""]
      .map(c=>`"${(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob(["\ufeff"+h+l],{type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`cevil_financeiro_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  const totalEntradas = lancamentos.filter(l=>l.tipo==="entrada").reduce((s,l)=>s+Number(l.valor),0);
  const totalSaidas   = lancamentos.filter(l=>l.tipo==="saida").reduce((s,l)=>s+Number(l.valor),0);
  const saldo         = totalEntradas - totalSaidas;
  const fmt = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  const categoriasPorTipo = form.tipo==="entrada" ? CATEGORIAS_ENT : CATEGORIAS_SAI;

  return (
    <div>
      <Toast {...(toast||{})} />
      <PageHeader title="Tesouraria" subtitle="Controle financeiro da associação" />

      {/* Cards resumo */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
        <div style={{background:C.branco,borderLeft:`4px solid ${C.verde}`,borderRadius:10,padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
          <div style={{fontSize:11,color:C.cinzaMedio,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Total Entradas</div>
          <div style={{fontSize:26,fontWeight:700,color:C.verde,fontFamily:"'Merriweather',serif"}}>{fmt(totalEntradas)}</div>
        </div>
        <div style={{background:C.branco,borderLeft:`4px solid ${C.vermelho}`,borderRadius:10,padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
          <div style={{fontSize:11,color:C.cinzaMedio,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Total Saídas</div>
          <div style={{fontSize:26,fontWeight:700,color:C.vermelho,fontFamily:"'Merriweather',serif"}}>{fmt(totalSaidas)}</div>
        </div>
        <div style={{background:C.branco,borderLeft:`4px solid ${saldo>=0?C.azulMedio:C.vermelho}`,borderRadius:10,padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
          <div style={{fontSize:11,color:C.cinzaMedio,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Saldo</div>
          <div style={{fontSize:26,fontWeight:700,color:saldo>=0?C.azulMedio:C.vermelho,fontFamily:"'Merriweather',serif"}}>{fmt(saldo)}</div>
        </div>
      </div>

      {/* Abas */}
      <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`2px solid #e8e8e8`}}>
        {[["lancamentos","Lançamentos"],["novo","Novo Lançamento"],["relatorio","Relatório"]].map(([id,label])=>(
          <button key={id} onClick={()=>setAba(id)}
            style={{padding:"10px 22px",background:"transparent",border:"none",
              borderBottom:`2px solid ${aba===id?C.dourado:"transparent"}`,
              color:aba===id?C.azulEscuro:C.cinzaMedio,fontWeight:aba===id?700:400,
              fontSize:13,cursor:"pointer",marginBottom:-2,fontFamily:"inherit"}}>
            {label}
          </button>
        ))}
      </div>

      {/* ABA: Novo Lançamento */}
      {aba==="novo" && (
        <Card>
          <SecaoTitulo icon="💰">Registrar Lançamento</SecaoTitulo>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Select label="Tipo *" value={form.tipo} onChange={setF("tipo")}
                options={[{value:"entrada",label:"✅ Entrada"},{value:"saida",label:"❌ Saída"}]} />
              <Input label="Data *" value={form.data} onChange={setF("data")} type="date" required />
            </div>
            <Input label="Descrição *" value={form.descricao} onChange={setF("descricao")} placeholder="Ex: Doação de empresa parceira" required />
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Input label="Valor (R$) *" value={form.valor} onChange={setF("valor")} placeholder="0,00" required />
              <Select label="Categoria *" value={form.categoria} onChange={setF("categoria")} required
                options={[{value:"",label:"Selecione..."},...categoriasPorTipo.map(c=>({value:c,label:c}))]} />
            </div>
            <Select label="Projeto (opcional)" value={form.projeto} onChange={setF("projeto")}
              options={[{value:"",label:"Nenhum / Geral"},...projetos.map(p=>({value:p.nome,label:p.nome}))]} />
            <Textarea label="Observações" value={form.observacoes} onChange={setF("observacoes")} placeholder="Informações adicionais..." rows={3} />
            <div style={{display:"flex",gap:10,paddingTop:4}}>
              <Btn onClick={salvarLanc} disabled={loading}
                color={form.tipo==="entrada"?C.verde:C.vermelho}>
                {loading?"Salvando...": form.tipo==="entrada"?"✅ Registrar Entrada":"❌ Registrar Saída"}
              </Btn>
              <Btn outline color={C.cinzaMedio} onClick={()=>setForm(emptyLanc)}>Limpar</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* ABA: Lançamentos */}
      {aba==="lancamentos" && (
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <SecaoTitulo icon="📋">Lançamentos</SecaoTitulo>
            <Btn small outline color={C.azulEscuro} onClick={exportarCSV}>⬇ Exportar CSV</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
            <Select label="Tipo" value={filtros.tipo} onChange={setFil("tipo")}
              options={[{value:"",label:"Todos"},{value:"entrada",label:"Entradas"},{value:"saida",label:"Saídas"}]} />
            <Select label="Projeto" value={filtros.projeto} onChange={setFil("projeto")}
              options={[{value:"",label:"Todos"},...projetos.map(p=>({value:p.nome,label:p.nome}))]} />
            <Input label="Data Início" value={filtros.dataInicio} onChange={setFil("dataInicio")} type="date" />
            <Input label="Data Fim"    value={filtros.dataFim}    onChange={setFil("dataFim")}    type="date" />
          </div>
          <Btn small color={C.azulMedio} onClick={loadLanc} style={{marginBottom:16}}>🔍 Filtrar</Btn>
          {lancamentos.length===0
            ? <div style={{textAlign:"center",padding:"40px 0",color:C.cinzaMedio}}>Nenhum lançamento encontrado.</div>
            : <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:C.azulEscuro}}>
                    {["Data","Tipo","Categoria","Descrição","Projeto","Valor","Ações"].map(h=>(
                      <th key={h} style={{padding:"9px 10px",textAlign:"left",color:C.branco,fontWeight:700,fontSize:11}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lancamentos.map((l,i)=>(
                    <tr key={l.id} style={{background:i%2===0?C.branco:C.cinzaClaro}}>
                      <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>{l.data?new Date(l.data+"T12:00:00").toLocaleDateString("pt-BR"):"—"}</td>
                      <td style={{padding:"8px 10px"}}>
                        <span style={{background:l.tipo==="entrada"?"#e6f7ec":"#fef0f0",
                          color:l.tipo==="entrada"?C.verde:C.vermelho,
                          padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:700}}>
                          {l.tipo==="entrada"?"↑ Entrada":"↓ Saída"}
                        </span>
                      </td>
                      <td style={{padding:"8px 10px"}}>{l.categoria||"—"}</td>
                      <td style={{padding:"8px 10px"}}>{l.descricao}</td>
                      <td style={{padding:"8px 10px",color:C.cinzaMedio}}>{l.projeto||"—"}</td>
                      <td style={{padding:"8px 10px",fontWeight:700,color:l.tipo==="entrada"?C.verde:C.vermelho}}>
                        {l.tipo==="saida"?"-":"+"}R$ {Number(l.valor).toLocaleString("pt-BR",{minimumFractionDigits:2})}
                      </td>
                      <td style={{padding:"8px 10px"}}>
                        <Btn small outline color={C.vermelho} onClick={()=>excluirLanc(l.id)}>Excluir</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </Card>
      )}

      {/* ABA: Relatório */}
      {aba==="relatorio" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <Card>
            <SecaoTitulo icon="📊">Por Categoria — Entradas</SecaoTitulo>
            {(() => {
              const ent = lancamentos.filter(l=>l.tipo==="entrada");
              const cats = {};
              ent.forEach(l=>{cats[l.categoria]=(cats[l.categoria]||0)+Number(l.valor);});
              const total = Object.values(cats).reduce((s,v)=>s+v,0)||1;
              return Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>(
                <div key={cat} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span>{cat}</span><span style={{fontWeight:700,color:C.verde}}>{fmt(val)}</span>
                  </div>
                  <div style={{height:6,background:C.cinzaClaro,borderRadius:4}}>
                    <div style={{width:`${Math.round((val/total)*100)}%`,height:"100%",background:C.verde,borderRadius:4}} />
                  </div>
                </div>
              ));
            })()}
          </Card>
          <Card>
            <SecaoTitulo icon="📊">Por Categoria — Saídas</SecaoTitulo>
            {(() => {
              const sai = lancamentos.filter(l=>l.tipo==="saida");
              const cats = {};
              sai.forEach(l=>{cats[l.categoria]=(cats[l.categoria]||0)+Number(l.valor);});
              const total = Object.values(cats).reduce((s,v)=>s+v,0)||1;
              return Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>(
                <div key={cat} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span>{cat}</span><span style={{fontWeight:700,color:C.vermelho}}>{fmt(val)}</span>
                  </div>
                  <div style={{height:6,background:C.cinzaClaro,borderRadius:4}}>
                    <div style={{width:`${Math.round((val/total)*100)}%`,height:"100%",background:C.vermelho,borderRadius:4}} />
                  </div>
                </div>
              ));
            })()}
          </Card>
          <Card style={{gridColumn:"1/-1"}}>
            <SecaoTitulo icon="📈">Resumo por Projeto</SecaoTitulo>
            {(() => {
              const pp = {};
              lancamentos.forEach(l=>{
                const key = l.projeto||"Geral";
                if(!pp[key]) pp[key]={entrada:0,saida:0};
                pp[key][l.tipo]+=Number(l.valor);
              });
              return (
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:C.azulEscuro}}>
                      {["Projeto","Entradas","Saídas","Saldo"].map(h=>(
                        <th key={h} style={{padding:"9px 12px",textAlign:"left",color:C.branco,fontWeight:700,fontSize:11}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(pp).map(([proj,v],i)=>(
                      <tr key={proj} style={{background:i%2===0?C.branco:C.cinzaClaro}}>
                        <td style={{padding:"8px 12px",fontWeight:600}}>{proj}</td>
                        <td style={{padding:"8px 12px",color:C.verde,fontWeight:600}}>{fmt(v.entrada)}</td>
                        <td style={{padding:"8px 12px",color:C.vermelho,fontWeight:600}}>{fmt(v.saida)}</td>
                        <td style={{padding:"8px 12px",fontWeight:700,color:(v.entrada-v.saida)>=0?C.azulMedio:C.vermelho}}>
                          {fmt(v.entrada-v.saida)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── PROJETOS ────────────────────────────────────────────────────────────────

function Projetos() {
  const [lista,setLista] = useState([]);
  const [form,setForm]   = useState({nome:"",descricao:"",status:"ativo"});
  const [toast,showToast] = useToast();

  async function load(){ const r=await supa("/projetos?select=*&order=nome.asc"); setLista(r||[]); }
  useEffect(()=>{load();},[]);

  async function salvar(){
    if(!form.nome){showToast("Nome obrigatório.","error");return;}
    try {
      await supa("/projetos",{method:"POST",body:JSON.stringify(form)});
      showToast("Projeto salvo!");setForm({nome:"",descricao:"",status:"ativo"});load();
    } catch(e){showToast(e.message.includes("unique")?"Nome já existe.":"Erro.","error");}
  }
  async function toggleStatus(p){
    await supa(`/projetos?id=eq.${p.id}`,{method:"PATCH",body:JSON.stringify({status:p.status==="ativo"?"inativo":"ativo"})});load();
  }
  async function excluir(id){
    if(!confirm("Excluir projeto?")) return;
    await supa(`/projetos?id=eq.${id}`,{method:"DELETE",prefer:""});load();
  }

  return (
    <div>
      <Toast {...(toast||{})} />
      <PageHeader title="Projetos" subtitle="Gerencie os projetos da associação" />
      <Card style={{marginBottom:24}}>
        <SecaoTitulo icon="➕">Novo Projeto</SecaoTitulo>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="Nome" value={form.nome} onChange={v=>setForm(p=>({...p,nome:v}))} placeholder="Ex: Educação e Reforço Escolar" required />
          <Textarea label="Descrição" value={form.descricao} onChange={v=>setForm(p=>({...p,descricao:v}))} placeholder="Objetivo do projeto..." rows={3} />
          <Select label="Status" value={form.status} onChange={v=>setForm(p=>({...p,status:v}))}
            options={[{value:"ativo",label:"✅ Ativo"},{value:"inativo",label:"⏸ Inativo"}]} />
        </div>
        <div style={{marginTop:16}}><Btn onClick={salvar} color="#e07020">💾 Salvar</Btn></div>
      </Card>
      <Card>
        <SecaoTitulo icon="📋">Projetos Cadastrados</SecaoTitulo>
        {lista.length===0 ? <p style={{color:C.cinzaMedio,fontSize:13}}>Nenhum projeto.</p>
          : <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:C.azulEscuro}}>
                {["Nome","Descrição","Status","Ações"].map(h=>(
                  <th key={h} style={{padding:"9px 12px",textAlign:"left",color:C.branco,fontWeight:700,fontSize:11}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {lista.map((p,i)=>(
                  <tr key={p.id} style={{background:i%2===0?C.branco:C.cinzaClaro}}>
                    <td style={{padding:"9px 12px",fontWeight:600}}>{p.nome}</td>
                    <td style={{padding:"9px 12px",color:C.cinzaMedio,maxWidth:280}}>{p.descricao||"—"}</td>
                    <td style={{padding:"9px 12px"}}>
                      <span style={{background:p.status==="ativo"?"#e6f7ec":"#f5f5f5",
                        color:p.status==="ativo"?C.verde:C.cinzaMedio,
                        padding:"2px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>
                        {p.status==="ativo"?"Ativo":"Inativo"}
                      </span>
                    </td>
                    <td style={{padding:"9px 12px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <Btn small outline color={p.status==="ativo"?C.cinzaMedio:C.verde} onClick={()=>toggleStatus(p)}>
                          {p.status==="ativo"?"Desativar":"Ativar"}
                        </Btn>
                        <Btn small outline color={C.vermelho} onClick={()=>excluir(p.id)}>Excluir</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </Card>
    </div>
  );
}

// ─── USUÁRIOS ────────────────────────────────────────────────────────────────

function Usuarios() {
  const [lista,setLista] = useState([]);
  const [form,setForm]   = useState({nome_completo:"",usuario:"",senha:"",confirmSenha:"",perfil:"visualizador"});
  const [toast,showToast] = useToast();

  async function load(){ const r=await supa("/sistema_usuarios?select=id,nome_completo,usuario,perfil,ativo,criado_em&order=nome_completo.asc"); setLista(r||[]); }
  useEffect(()=>{load();},[]);

  async function criar(){
    const {nome_completo,usuario,senha,confirmSenha,perfil}=form;
    if(!nome_completo||!usuario||!senha){showToast("Preencha todos os campos.","error");return;}
    if(senha!==confirmSenha){showToast("Senhas não conferem.","error");return;}
    if(senha.length<6){showToast("Mínimo 6 caracteres.","error");return;}
    try {
      await supa("/sistema_usuarios",{method:"POST",body:JSON.stringify({nome_completo,usuario,senha_hash:hashSimple(senha),perfil,ativo:true})});
      showToast("Usuário criado!");
      setForm({nome_completo:"",usuario:"",senha:"",confirmSenha:"",perfil:"visualizador"});load();
    } catch(e){showToast(e.message.includes("unique")?"Usuário já existe.":"Erro.","error");}
  }

  async function toggleAtivo(u){
    await supa(`/sistema_usuarios?id=eq.${u.id}`,{method:"PATCH",body:JSON.stringify({ativo:!u.ativo})});load();
  }

  return (
    <div>
      <Toast {...(toast||{})} />
      <PageHeader title="Usuários" subtitle="Gerencie os acessos ao sistema" />
      <div style={{background:"#f0eaff",border:"1px solid #c4aaee",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#7c4dbb",marginBottom:20}}>
        🔒 Área exclusiva de administradores.
      </div>
      <Card style={{marginBottom:24}}>
        <SecaoTitulo icon="➕">Criar Usuário</SecaoTitulo>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="Nome Completo" value={form.nome_completo} onChange={v=>setForm(p=>({...p,nome_completo:v}))} placeholder="Ex: Ana Paula Ferreira" required />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Input label="Login" value={form.usuario} onChange={v=>setForm(p=>({...p,usuario:v}))} placeholder="ana.paula" required />
            <Input label="Senha" value={form.senha} onChange={v=>setForm(p=>({...p,senha:v}))} type="password" placeholder="Mínimo 6 caracteres" required />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Input label="Confirmar Senha" value={form.confirmSenha} onChange={v=>setForm(p=>({...p,confirmSenha:v}))} type="password" required />
            <Select label="Perfil" value={form.perfil} onChange={v=>setForm(p=>({...p,perfil:v}))} required
              options={[{value:"visualizador",label:"👁 Visualizador"},{value:"tesouraria",label:"💰 Tesouraria"},{value:"super_admin",label:"👑 Super Admin"}]} />
          </div>
        </div>
        <div style={{marginTop:16}}><Btn onClick={criar} color="#7c4dbb">+ Criar Usuário</Btn></div>
      </Card>
      <Card>
        <SecaoTitulo icon="👥">Usuários do Sistema</SecaoTitulo>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#7c4dbb"}}>
            {["Nome","Usuário","Perfil","Status","Criado","Ações"].map(h=>(
              <th key={h} style={{padding:"9px 12px",textAlign:"left",color:C.branco,fontWeight:700,fontSize:11}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {lista.length===0
              ? <tr><td colSpan={6} style={{padding:16,color:C.cinzaMedio,textAlign:"center"}}>Nenhum usuário.</td></tr>
              : lista.map((u,i)=>(
                <tr key={u.id} style={{background:i%2===0?C.branco:C.cinzaClaro}}>
                  <td style={{padding:"8px 12px",fontWeight:600}}>{u.nome_completo}</td>
                  <td style={{padding:"8px 12px",color:C.cinzaMedio}}>{u.usuario}</td>
                  <td style={{padding:"8px 12px"}}>
                    <span style={{
                      background:u.perfil==="super_admin"?"#f0eaff":u.perfil==="tesouraria"?"#fff8e6":"#e8f2fc",
                      color:u.perfil==="super_admin"?"#7c4dbb":u.perfil==="tesouraria"?C.dourado:C.azulMedio,
                      padding:"2px 8px",borderRadius:12,fontSize:12,fontWeight:700}}>
                      {u.perfil==="super_admin"?"👑 Super Admin":u.perfil==="tesouraria"?"💰 Tesouraria":"👁 Visualizador"}
                    </span>
                  </td>
                  <td style={{padding:"8px 12px"}}>
                    <span style={{background:u.ativo?"#e6f7ec":"#fef0f0",color:u.ativo?C.verde:C.vermelho,padding:"2px 8px",borderRadius:12,fontSize:12,fontWeight:600}}>
                      {u.ativo?"Ativo":"Inativo"}
                    </span>
                  </td>
                  <td style={{padding:"8px 12px",color:C.cinzaMedio,whiteSpace:"nowrap"}}>{u.criado_em?new Date(u.criado_em).toLocaleDateString("pt-BR"):"—"}</td>
                  <td style={{padding:"8px 12px"}}>
                    <Btn small outline color={u.ativo?C.vermelho:C.verde} onClick={()=>toggleAtivo(u)}>
                      {u.ativo?"Desativar":"Ativar"}
                    </Btn>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── MINHA CONTA ────────────────────────────────────────────────────────────

function MinhaConta({ user }) {
  const [senhaAtual,setSenhaAtual] = useState("");
  const [senhaNova,setSenhaNova]   = useState("");
  const [senhaConf,setSenhaConf]   = useState("");
  const [toast,showToast]          = useToast();

  async function trocarSenha(){
    if(!senhaAtual||!senhaNova||!senhaConf){showToast("Preencha todos os campos.","error");return;}
    if(senhaNova!==senhaConf){showToast("Senhas não conferem.","error");return;}
    if(senhaNova.length<6){showToast("Mínimo 6 caracteres.","error");return;}
    const rows=await supa(`/sistema_usuarios?id=eq.${user.id}&senha_hash=eq.${hashSimple(senhaAtual)}&select=id`);
    if(!rows?.length){showToast("Senha atual incorreta.","error");return;}
    await supa(`/sistema_usuarios?id=eq.${user.id}`,{method:"PATCH",body:JSON.stringify({senha_hash:hashSimple(senhaNova)})});
    showToast("Senha alterada com sucesso!");
    setSenhaAtual("");setSenhaNova("");setSenhaConf("");
  }

  return (
    <div>
      <Toast {...(toast||{})} />
      <PageHeader title="Minha Conta" subtitle="Suas informações de acesso" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card>
          <SecaoTitulo icon="👤">Informações</SecaoTitulo>
          <div style={{fontSize:14,lineHeight:2.2}}>
            <div><strong>Nome:</strong> {user.nome_completo}</div>
            <div><strong>Usuário:</strong> {user.usuario}</div>
            <div><strong>Perfil:</strong> {user.perfil==="super_admin"?"Super Admin":user.perfil==="tesouraria"?"Tesouraria":"Visualizador"}</div>
          </div>
        </Card>
        <Card>
          <SecaoTitulo icon="🔑">Trocar Senha</SecaoTitulo>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Input label="Senha Atual" value={senhaAtual} onChange={setSenhaAtual} type="password" placeholder="••••••" />
            <Input label="Nova Senha"  value={senhaNova}  onChange={setSenhaNova}  type="password" placeholder="Mínimo 6 caracteres" />
            <Input label="Confirmar"   value={senhaConf}  onChange={setSenhaConf}  type="password" placeholder="Repita a senha" />
            <Btn onClick={trocarSenha} color={C.azulEscuro} full>🔑 Trocar Senha</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── CONFIGURAÇÕES ───────────────────────────────────────────────────────────

const SQL_SCRIPT = `-- TABELAS CEVIL
CREATE TABLE IF NOT EXISTS pessoas (
  id bigserial primary key,
  nome_completo text not null,
  cpf text not null unique,
  data_nascimento date,
  cep text, rua text, numero text,
  complemento text, bairro text,
  cidade text, estado text,
  telefone text, email text,
  emerg_nome text, emerg_telefone text,
  criado_em timestamptz default now()
);

CREATE TABLE IF NOT EXISTS visitas (
  id bigserial primary key,
  pessoa_id bigint references pessoas(id) on delete cascade,
  projeto text not null,
  data_visita date not null,
  observacoes text,
  criado_em timestamptz default now()
);

CREATE TABLE IF NOT EXISTS projetos (
  id bigserial primary key,
  nome text not null unique,
  descricao text,
  status text default 'ativo',
  criado_em timestamptz default now()
);

CREATE TABLE IF NOT EXISTS financeiro (
  id bigserial primary key,
  descricao text not null,
  tipo text not null,
  valor numeric(12,2) not null,
  data date not null,
  categoria text,
  projeto text,
  observacoes text,
  criado_em timestamptz default now()
);

CREATE TABLE IF NOT EXISTS sistema_usuarios (
  id bigserial primary key,
  nome_completo text not null,
  usuario text not null unique,
  senha_hash text not null,
  perfil text default 'normal',
  ativo boolean default true,
  criado_em timestamptz default now()
);

-- Desabilitar RLS
ALTER TABLE pessoas          DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitas          DISABLE ROW LEVEL SECURITY;
ALTER TABLE projetos         DISABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro       DISABLE ROW LEVEL SECURITY;
ALTER TABLE sistema_usuarios DISABLE ROW LEVEL SECURITY;

-- Usuários iniciais
-- super_admin / admin123
INSERT INTO sistema_usuarios (nome_completo,usuario,senha_hash,perfil)
VALUES ('Administrador','admin','39c43b7d','super_admin')
ON CONFLICT (usuario) DO NOTHING;

-- tesouraria / tesouraria123
INSERT INTO sistema_usuarios (nome_completo,usuario,senha_hash,perfil)
VALUES ('Tesouraria CEVIL','tesouraria','3bb05aa1','tesouraria')
ON CONFLICT (usuario) DO NOTHING;

-- visualizador / cevil2026
INSERT INTO sistema_usuarios (nome_completo,usuario,senha_hash,perfil)
VALUES ('Visualizador','visualizador','6da329f9','visualizador')
ON CONFLICT (usuario) DO NOTHING;`;

function Configuracoes() {
  const [copied,setCopied] = useState(false);
  function copiar(){navigator.clipboard.writeText(SQL_SCRIPT);setCopied(true);setTimeout(()=>setCopied(false),2000);}
  return (
    <div>
      <PageHeader title="Configurações" subtitle="SQL para criar/atualizar tabelas no Supabase" />
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SecaoTitulo icon="▣">Script SQL</SecaoTitulo>
          <Btn small outline color={C.azulEscuro} onClick={copiar}>{copied?"✅ Copiado!":"📋 Copiar SQL"}</Btn>
        </div>
        <pre style={{background:"#0d1f0a",color:"#7ddb5e",borderRadius:8,padding:"20px 24px",
          fontSize:12,lineHeight:1.7,overflow:"auto",maxHeight:480,fontFamily:"monospace",margin:0}}>
          {SQL_SCRIPT}
        </pre>
        <div style={{marginTop:16,fontSize:13,color:C.cinzaMedio,lineHeight:1.8}}>
          <strong style={{color:C.azulEscuro}}>Como usar:</strong><br/>
          1. Supabase → SQL Editor → Cole e execute<br/>
          2. <strong>Super Admin:</strong> <code style={{background:C.cinzaClaro,padding:"1px 6px",borderRadius:4}}>admin</code> / <code style={{background:C.cinzaClaro,padding:"1px 6px",borderRadius:4}}>admin123</code><br/>
          3. <strong>Tesouraria:</strong> <code style={{background:C.cinzaClaro,padding:"1px 6px",borderRadius:4}}>tesouraria</code> / <code style={{background:C.cinzaClaro,padding:"1px 6px",borderRadius:4}}>tesouraria123</code><br/>
          4. <strong>Visualizador:</strong> <code style={{background:C.cinzaClaro,padding:"1px 6px",borderRadius:4}}>visualizador</code> / <code style={{background:C.cinzaClaro,padding:"1px 6px",borderRadius:4}}>cevil2026</code>
        </div>
      </Card>
    </div>
  );
}

// ─── APP ROOT ────────────────────────────────────────────────────────────────

export default function App() {
  const [user,setUser]       = useState(null);
  const [page,setPage]       = useState("dashboard");
  const [pessoaId,setPessoaId] = useState(null);

  if(!user) return <Login onLogin={setUser} />;

  const { podeEditar, podeTesouraria, podeUsuarios, podeProjetos, podeConfigs } = usePerfil(user);

  function Bloqueado({ msg }) {
    return (
      <div style={{textAlign:"center",padding:"80px 40px"}}>
        <div style={{fontSize:48,marginBottom:16}}>🔒</div>
        <h2 style={{color:C.azulEscuro,fontFamily:"'Merriweather',serif",marginBottom:8}}>Acesso Restrito</h2>
        <p style={{color:C.cinzaMedio,fontSize:14}}>{msg || "Seu perfil não tem permissão para acessar esta área."}</p>
      </div>
    );
  }

  function renderPage(){
    switch(page){
      case "dashboard":        return <Dashboard setPage={setPage} />;
      case "novo-cadastro":    return podeEditar     ? <NovoCadastro onSaved={()=>setPage("pessoas")} />   : <Bloqueado msg="Somente o Super Admin pode cadastrar pessoas." />;
      case "pessoas":          return                  <Pessoas setPage={setPage} setPessoaId={setPessoaId} user={user} />;
      case "perfil-pessoa":    return                  <PerfilPessoa pessoaId={pessoaId} setPage={setPage} user={user} />;
      case "registrar-visita": return podeEditar     ? <RegistrarVisita />                                 : <Bloqueado msg="Somente o Super Admin pode registrar visitas." />;
      case "relatorios":       return                  <Relatorios />;
      case "tesouraria":       return podeTesouraria ? <Tesouraria />                                      : <Bloqueado msg="Esta área é exclusiva para Tesouraria e Super Admin." />;
      case "minha-conta":      return                  <MinhaConta user={user} />;
      case "projetos":         return podeProjetos   ? <Projetos />                                        : <Bloqueado msg="Somente o Super Admin pode gerenciar projetos." />;
      case "usuarios":         return podeUsuarios   ? <Usuarios />                                        : <Bloqueado msg="Somente o Super Admin pode gerenciar usuários." />;
      case "configuracoes":    return podeConfigs    ? <Configuracoes />                                   : <Bloqueado msg="Somente o Super Admin pode acessar as configurações." />;
      default:                 return <Dashboard setPage={setPage} />;
    }
  }

  return (
    <Layout user={user} page={page} setPage={setPage} onLogout={()=>{setUser(null);setPage("dashboard");}}>
      {renderPage()}
    </Layout>
  );
}
