const SENHA = '269Roberio';
let isAdmin = false;
let players = [];
try { players = JSON.parse(localStorage.getItem('nevrion_v2') || '[]'); } catch(e) {}
let editIndex = null;

function entrar() {
  const input = document.getElementById('senha-input').value;
  if (input === SENHA) {
    isAdmin = true;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('hub').style.display = 'block';
    document.getElementById('admin-btns').style.display = 'flex';
    document.getElementById('btn-sair').style.display = 'block';
    renderTable();
  } else {
    document.getElementById('login-erro').textContent = 'Senha incorreta.';
  }
}

function verRanking() {
  isAdmin = false;
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('hub').style.display = 'block';
  document.getElementById('admin-btns').style.display = 'none';
  document.getElementById('btn-sair').style.display = 'none';
  renderTable();
}

function sair() {
  isAdmin = false;
  document.getElementById('hub').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('senha-input').value = '';
  document.getElementById('login-erro').textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('senha-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') entrar();
  });
});

function save() {
  try { localStorage.setItem('nevrion_v2', JSON.stringify(players)); } catch(e) {}
}

function pct(v, e, d) {
  const j = v + e + d;
  return j === 0 ? 0 : Math.round(((v + e * 0.5) / j) * 100);
}

function pctClass(p) {
  return p >= 60 ? 'pct-high' : p >= 40 ? 'pct-mid' : 'pct-low';
}

function renderTable() {
  const sorted = [...players].sort((a, b) => pct(b.v,b.e,b.d) - pct(a.v,a.e,a.d));
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = '';
  const total = sorted.length;

  if (total === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty">Nenhum player cadastrado</td></tr>';
    return;
  }

  sorted.forEach((p, i) => {
    const j = p.v + p.e + p.d;
    const pc = pct(p.v, p.e, p.d);
    const cls = pctClass(pc);
    const origIdx = players.indexOf(p);

    let rankStyle = 'color:#444;font-weight:700';
    if (i < 4) rankStyle = 'color:#1D9E75;font-weight:900;font-size:15px';
    if (total >= 8 && i >= total - 4) rankStyle = 'color:#E8000D;font-weight:900;font-size:15px';

    const editBtn = isAdmin ? `
      <div class="acoes">
        <button class="btn-edit" onclick="openModal(${origIdx})">editar</button>
        <button class="btn-del" onclick="excluirPlayer(${origIdx})">excluir</button>
      </div>` : '';

    tbody.innerHTML += `
      <tr>
        <td><span style="${rankStyle}">${i + 1}</span></td>
        <td><span class="player-name">${p.name}</span></td>
        <td style="color:#555">${j}</td>
        <td style="color:#1D9E75;font-weight:700">${p.v}</td>
        <td style="color:#777">${p.e}</td>
        <td style="color:#E8000D">${p.d}</td>
        <td>
          <div class="pct-bar-wrap ${cls}">
            <div class="pct-bar"><div class="pct-fill" style="width:${pc}%"></div></div>
            <span class="pct-val">${pc}%</span>
          </div>
        </td>
        <td>${editBtn}</td>
      </tr>`;
  });
}

function openModal(idx) {
  if (!isAdmin) return;
  editIndex = idx;
  document.getElementById('modal-title').textContent = idx === null ? 'Adicionar player' : 'Atualizar resultado';
  if (idx !== null && idx !== 'edit') {
    const p = players[idx];
    document.getElementById('f-name').value = p.name;
    document.getElementById('f-name').disabled = true;
    document.getElementById('f-v').value = p.v;
    document.getElementById('f-e').value = p.e;
    document.getElementById('f-d').value = p.d;
  } else {
    document.getElementById('f-name').value = '';
    document.getElementById('f-name').disabled = false;
    document.getElementById('f-v').value = 0;
    document.getElementById('f-e').value = 0;
    document.getElementById('f-d').value = 0;
  }
  document.getElementById('modal-bg').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
  editIndex = null;
}

function savePlayer() {
  if (!isAdmin) return;
  const name = document.getElementById('f-name').value.trim();
  const v = parseInt(document.getElementById('f-v').value) || 0;
  const e = parseInt(document.getElementById('f-e').value) || 0;
  const d = parseInt(document.getElementById('f-d').value) || 0;
  if (!name) { toast('Digite o nome do player'); return; }
  const now = new Date().toLocaleString('pt-BR');
  if (editIndex === null) {
    if (players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
      toast('Player já cadastrado'); return;
    }
    players.push({ name, v, e, d });
    setInfo(`"${name}" adicionado em ${now}`);
  } else {
    players[editIndex] = { ...players[editIndex], v, e, d };
    setInfo(`"${players[editIndex].name}" atualizado em ${now}`);
  }
  save(); renderTable(); closeModal();
}

function excluirPlayer(idx) {
  if (!isAdmin) return;
  if (confirm(`Excluir "${players[idx].name}"? Isso não pode ser desfeito.`)) {
    const nome = players[idx].name;
    players.splice(idx, 1);
    save();
    renderTable();
    setInfo(`"${nome}" removido em ` + new Date().toLocaleString('pt-BR'));
    toast('Player excluído!');
  }
}

function confirmZerar() {
  if (!isAdmin) return;
  if (confirm('Zerar todos os resultados? Essa ação não pode ser desfeita.')) {
    players = players.map(p => ({ ...p, v: 0, e: 0, d: 0 }));
    save(); renderTable();
    setInfo('Resultados zerados em ' + new Date().toLocaleString('pt-BR'));
    toast('Zerado!');
  }
}

function setInfo(msg) {
  document.getElementById('update-info').textContent = 'Última atualização: ' + msg;
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 2500);
}