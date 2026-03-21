import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const RISK_PROFILES = [
  { name: "Conservative", emoji: "🛡️", color: "#22c55e", apy: "8-15%", desc: "Low vol vaults, stable yield" },
  { name: "Balanced", emoji: "⚖️", color: "#f59e0b", apy: "15-35%", desc: "Mix farms + lending" },
  { name: "Aggressive", emoji: "🔥", color: "#ef4444", apy: "30-80%", desc: "Leveraged high-APY farms" },
  { name: "Custom", emoji: "⚙️", color: "#6366f1", apy: "Custom", desc: "Manual whitelist + drawdown limit" },
];

const PROTOCOLS = [
  { name: "YieldBTC", apy: 12.4, tvl: "2.4M", risk: "Low", color: "#22c55e" },
  { name: "NexusVault", apy: 28.7, tvl: "1.1M", risk: "Med", color: "#f59e0b" },
  { name: "MotoChef", apy: 45.2, tvl: "0.8M", risk: "High", color: "#ef4444" },
  { name: "NEXFI Lending", apy: 18.3, tvl: "3.2M", risk: "Low", color: "#22c55e" },
  { name: "SatLoop", apy: 67.8, tvl: "0.3M", risk: "High", color: "#ef4444" },
];

const WHALES = [
  { addr: "opt1qwhal...e001", apy30d: 82.4, strategy: "MotoChef + SatLoop", shadow: true },
  { addr: "opt1qwhal...e002", apy30d: 61.2, strategy: "NexusVault + NEXFI", shadow: false },
  { addr: "opt1qwhal...e003", apy30d: 94.1, strategy: "Aggressive Loop", shadow: true },
];

function generateChart() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `D${i + 1}`,
    myApy: +(10 + Math.random() * 40).toFixed(1),
    marketApy: +(15 + Math.random() * 20).toFixed(1),
  }));
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [profile, setProfile] = useState(RISK_PROFILES[1]);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [notification, setNotification] = useState("");
  const [staked, setStaked] = useState(0);
  const [totalYield, setTotalYield] = useState(0);
  const [insurancePool, setInsurancePool] = useState(0.042);
  const [currentApy, setCurrentApy] = useState(28.4);
  const [marketApy] = useState(22.1);
  const [chart] = useState(generateChart);
  const [autoRoute, setAutoRoute] = useState(false);
  const [currentProtocol, setCurrentProtocol] = useState(PROTOCOLS[1]);
  const [shadowMode, setShadowMode] = useState(false);
  const [blockCount, setBlockCount] = useState(941458);
  const [profitToken, setProfitToken] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setBlockCount(b => b + 1);
      if (staked > 0 && autoRoute) {
        setTotalYield(y => +(y + staked * currentApy / 100 / 52560).toFixed(6));
        setInsurancePool(p => +(p + staked * 0.001 / 52560).toFixed(6));
        setProfitToken(p => +(p + 0.1).toFixed(1));
        if (Math.random() < 0.1) {
          const newProtocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
          setCurrentProtocol(newProtocol);
          setCurrentApy(newProtocol.apy);
          notify(`🔄 AI switched to ${newProtocol.name} — ${newProtocol.apy}% APY`);
        }
      }
    }, 3000);
    return () => clearInterval(t);
  }, [staked, autoRoute, currentApy]);

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(""), 4000); };

  const connect = async () => {
    try {
      const w = (window as any).opnet || (window as any).unisat;
      if (!w) { notify("⚠️ Install OP_WALLET!"); return; }
      const acc = await w.requestAccounts();
      setAddress(acc[0]); setConnected(true); notify("✅ Connected. AI analyzing your wallet...");
    } catch { notify("❌ Connection failed"); }
  };

  const deposit = () => {
    setStaked(s => s + 0.001);
    setAutoRoute(true);
    notify("💰 Deposited! AI routing to best yield...");
  };

  const claimCompensation = () => {
    if (currentApy < marketApy) {
      const comp = +(insurancePool * 0.5).toFixed(6);
      setTotalYield(y => +(y + comp).toFixed(6));
      notify(`✅ Compensation claimed: ${comp} BTC!`);
    } else {
      notify("ℹ️ Your APY exceeds market average. No compensation needed.");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#020b18", color:"#c8e6ff", fontFamily:"monospace", padding:"1rem", maxWidth:480, margin:"0 auto" }}>
      <style>{`
        @import url(https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap);
        * { box-sizing: border-box; }
        .card { background: #0a1628; border: 1px solid #0af3; border-radius: 12px; padding: 1rem; }
        .btn { background: linear-gradient(135deg,#0066ff,#00aaff); border:none; color:#fff; padding:0.6rem 1.2rem; border-radius:10px; cursor:pointer; font-family:monospace; font-size:0.85rem; }
        .btn-sm { background:#0a1628; border:1px solid #0af5; color:#7dd3fc; padding:0.4rem 0.8rem; border-radius:8px; cursor:pointer; font-family:monospace; font-size:0.78rem; }
        .toggle { width:40px; height:20px; border-radius:10px; cursor:pointer; border:none; transition:background 0.3s; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {notification && <div style={{ position:"fixed", top:"1rem", right:"1rem", left:"1rem", background:"#0a1628", border:"1px solid #0af", borderRadius:"12px", padding:"0.8rem", zIndex:999, textAlign:"center", fontSize:"0.82rem" }}>{notification}</div>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <div>
          <div style={{ fontSize:"1.3rem", fontWeight:"bold", color:"#7dd3fc" }}>🔮 ProfitOracle</div>
          <div style={{ fontSize:"0.65rem", color:"#1e40af" }}>AI Yield Router • Bitcoin L1 • Block #{blockCount.toLocaleString()}</div>
        </div>
        {connected ? <div style={{ fontSize:"0.7rem", background:"#0a1628", border:"1px solid #0af3", padding:"0.3rem 0.7rem", borderRadius:"8px" }}>{address.slice(0,8)}...</div> : <button className="btn" onClick={connect}>Connect</button>}
      </div>

      <div style={{ display:"flex", gap:"0.4rem", marginBottom:"1rem", overflowX:"auto" }}>
        {["dashboard","router","insurance","whales","governance"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"0.4rem 0.6rem", borderRadius:"8px", border:`1px solid ${tab===t?"#0af":"#0af3"}`, background:tab===t?"#1e40af":"#0a1628", color:tab===t?"#fff":"#7dd3fc", cursor:"pointer", fontFamily:"monospace", fontSize:"0.7rem", whiteSpace:"nowrap" }}>
            {t==="dashboard"?"📊 Dash":t==="router"?"🔄 Router":t==="insurance"?"🛡️ Insurance":t==="whales"?"🐋 Whales":"🏛️ Gov"}
          </button>
        ))}
      </div>

      {tab==="dashboard" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"0.6rem", marginBottom:"1rem" }}>
            {[
              { label:"My APY", val:`${currentApy}%`, color:currentApy>marketApy?"#22c55e":"#ef4444", sub:"vs market "+marketApy+"%" },
              { label:"Total Yield", val:totalYield.toFixed(6)+" BTC", color:"#22c55e", sub:"All time" },
              { label:"Staked", val:staked.toFixed(3)+" BTC", color:"#7dd3fc", sub:"Auto-routing" },
              { label:"$PROFIT", val:profitToken.toFixed(1), color:"#f59e0b", sub:"Earned tokens" },
            ].map((s, i) => (
              <div key={i} className="card">
                <div style={{ fontSize:"0.65rem", color:"#1e40af" }}>{s.label}</div>
                <div style={{ fontSize:"1rem", fontWeight:"bold", color:s.color }}>{s.val}</div>
                <div style={{ fontSize:"0.6rem", color:"#1e40af" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom:"1rem" }}>
            <div style={{ fontSize:"0.8rem", color:"#7dd3fc", marginBottom:"0.5rem" }}>📈 APY Performance (30d)</div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="my" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="mkt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0af" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0af" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize:9, fill:"#1e40af" }} />
                <YAxis tick={{ fontSize:9, fill:"#1e40af" }} />
                <Tooltip contentStyle={{ background:"#0a1628", border:"1px solid #0af3", fontSize:"0.72rem" }} />
                <Area type="monotone" dataKey="myApy" stroke="#22c55e" fill="url(#my)" strokeWidth={2} name="My APY" />
                <Area type="monotone" dataKey="marketApy" stroke="#0af" fill="url(#mkt)" strokeWidth={1} name="Market" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
              <span style={{ fontSize:"0.8rem", color:"#7dd3fc" }}>Current: {currentProtocol.name}</span>
              <span style={{ fontSize:"0.75rem", color:currentProtocol.color }}>{currentProtocol.apy}% APY</span>
            </div>
            <div style={{ display:"flex", gap:"0.5rem" }}>
              <button className="btn" onClick={deposit} style={{ flex:1 }}>💰 Deposit 0.001 BTC</button>
              <button className="btn-sm" onClick={() => setAutoRoute(a => !a)} style={{ background:autoRoute?"#16a34a":"#0a1628" }}>{autoRoute?"Auto ON":"Auto OFF"}</button>
            </div>
          </div>
        </>
      )}

      {tab==="router" && (
        <div>
          <div style={{ fontSize:"0.8rem", color:"#7dd3fc", marginBottom:"0.8rem" }}>🤖 AI Risk Profile</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"1rem" }}>
            {RISK_PROFILES.map(rp => (
              <div key={rp.name} onClick={() => setProfile(rp)} className="card" style={{ cursor:"pointer", border:`1px solid ${profile.name===rp.name?rp.color:"#0af3"}`, textAlign:"center" }}>
                <div style={{ fontSize:"1.5rem" }}>{rp.emoji}</div>
                <div style={{ fontSize:"0.78rem", color:rp.color }}>{rp.name}</div>
                <div style={{ fontSize:"0.65rem", color:"#1e40af" }}>{rp.apy}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:"0.8rem", color:"#7dd3fc", marginBottom:"0.5rem" }}>📊 Available Protocols</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
            {PROTOCOLS.map(p => (
              <div key={p.name} className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:"0.82rem", color:"#c8e6ff" }}>{p.name}</div>
                  <div style={{ fontSize:"0.65rem", color:"#1e40af" }}>TVL: ${p.tvl}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:p.color, fontSize:"0.85rem" }}>{p.apy}%</div>
                  <div style={{ fontSize:"0.65rem", color:p.color }}>{p.risk} risk</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="insurance" && (
        <div className="card">
          <div style={{ fontSize:"0.9rem", color:"#7dd3fc", marginBottom:"1rem" }}>🛡️ Profit Insurance Pool</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"1rem" }}>
            <div className="card" style={{ textAlign:"center" }}>
              <div style={{ color:"#22c55e", fontSize:"1rem" }}>{insurancePool.toFixed(5)}</div>
              <div style={{ color:"#1e40af", fontSize:"0.65rem" }}>Pool BTC</div>
            </div>
            <div className="card" style={{ textAlign:"center" }}>
              <div style={{ color:currentApy<marketApy?"#ef4444":"#22c55e", fontSize:"1rem" }}>{currentApy<marketApy?"ELIGIBLE":"SAFE"}</div>
              <div style={{ color:"#1e40af", fontSize:"0.65rem" }}>Claim Status</div>
            </div>
          </div>
          <div style={{ fontSize:"0.75rem", color:"#1e40af", marginBottom:"1rem" }}>
            Your APY: <span style={{ color:currentApy>marketApy?"#22c55e":"#ef4444" }}>{currentApy}%</span> vs Market: <span style={{ color:"#7dd3fc" }}>{marketApy}%</span>
            {currentApy < marketApy && <div style={{ color:"#ef4444", marginTop:"0.3rem" }}>⚠️ Underperforming! You can claim compensation.</div>}
          </div>
          <button className="btn" style={{ width:"100%" }} onClick={claimCompensation}>🛡️ Claim Compensation</button>
          <div style={{ fontSize:"0.65rem", color:"#1e40af", textAlign:"center", marginTop:"0.5rem" }}>
            10% of routed yields → insurance pool • Up to 50% compensation
          </div>
        </div>
      )}

      {tab==="whales" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.8rem" }}>
            <span style={{ fontSize:"0.8rem", color:"#7dd3fc" }}>🐋 Whale Shadow Mode</span>
            <button className="btn-sm" onClick={() => { setShadowMode(s => !s); notify(shadowMode?"Shadow mode OFF":"🐋 Shadowing top whales!"); }} style={{ background:shadowMode?"#16a34a":"#0a1628" }}>
              {shadowMode?"ON":"OFF"}
            </button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
            {WHALES.map((w, i) => (
              <div key={i} className="card">
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
                  <span style={{ color:"#7dd3fc", fontSize:"0.78rem" }}>🐋 {w.addr}</span>
                  <span style={{ color:"#22c55e", fontSize:"0.78rem" }}>{w.apy30d}% APY</span>
                </div>
                <div style={{ fontSize:"0.7rem", color:"#1e40af", marginBottom:"0.3rem" }}>{w.strategy}</div>
                {w.shadow && shadowMode && <div style={{ fontSize:"0.68rem", color:"#f59e0b" }}>✅ Shadowing this whale</div>}
                {!w.shadow && <div style={{ fontSize:"0.68rem", color:"#1e40af" }}>Strategy too risky for shadow</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="governance" && (
        <div className="card">
          <div style={{ fontSize:"0.9rem", color:"#7dd3fc", marginBottom:"1rem" }}>🏛️ $PROFIT Governance</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.5rem", marginBottom:"1rem" }}>
            {[
              { label:"Your $PROFIT", val:profitToken.toFixed(1), color:"#f59e0b" },
              { label:"APY Boost", val:"+5%", color:"#22c55e" },
              { label:"Fee Discount", val:"20%", color:"#7dd3fc" },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign:"center", padding:"0.5rem" }}>
                <div style={{ color:s.color, fontSize:"0.9rem" }}>{s.val}</div>
                <div style={{ color:"#1e40af", fontSize:"0.6rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:"0.75rem", color:"#1e40af", marginBottom:"1rem" }}>
            Revenue distribution:<br/>
            30% → buyback/burn • 40% → stakers • 30% → insurance
          </div>
          <button className="btn" style={{ width:"100%" }} onClick={() => notify("🏛️ Staking $PROFIT tokens — APY boost activated!")}>
            🏛️ Stake $PROFIT Tokens
          </button>
        </div>
      )}

      <div style={{ textAlign:"center", marginTop:"1.5rem", fontSize:"0.65rem", color:"#0a1628" }}>
        ProfitOracle • AI Yield Router • Bitcoin L1 • OPNet
      </div>
    </div>
  );
}
