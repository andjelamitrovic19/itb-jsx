const emojis = ["😄", "😍", "🎉", "🌟", "🐱", "🍕", "🚀", "🎈", "🍦", "🎸", "🐶", "🍔", "🚗", "🌈", "🎮", "👾", "🍓", "🎁", "🎂", "🎩", "🌼", "🚁", "🚢", "🍇", "🎲", "🎤", "🍟", "🎧", "🍌", "🏀", "🎾", "🦁", "🐬", "🍩", "🚂", "🚑", "🚓", "🚒", "🚜", "🚤", "🚢", "🚀", "🚲", "🏍️", "🚁", "🛸", "🌋", "🌠", "🎡", "🎢", "🎆", "🎇", "🧨", "🎺", "🎻", "🎹", "🎷", "🎸", "🎤", "🎧", "🎭", "🎨", "🧁", "🍬", "🍭", "🍫", "🍩", "🍪", "🍦", "🍧", "🍨"];

document.getElementById("korisnicko-ime").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    sacuvajKorisnickoIme();
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === "F5") {
    localStorage.clear();
  }
});

let izabraniNivo;
document.querySelectorAll('input[name="level"]').forEach(radio => {
  radio.addEventListener('change', () => {
    izabraniNivo = radio.value;
    localStorage.setItem("izabraniNivo", izabraniNivo);
  });
});
let intervalTajmera;
let protekloVreme = 0;

function generisiIgru(izabraniNivo) {
  const dimenzije = dohvatiDimenzije();
  const tablaIgre = document.getElementById('tabla-igre');
  tablaIgre.innerHTML = '';
  const promesaniEmodžiji = promešajNiz(emojis.slice(0, (dimenzije.redovi * dimenzije.kolone) / 2).concat(emojis.slice(0, (dimenzije.redovi * dimenzije.kolone) / 2)));
  const promesanaTabla = promešajNiz(promesaniEmodžiji);

  for (let i = 0; i < dimenzije.redovi; i++) {
    const red = document.createElement('div');
    red.style.display = 'flex';

    for (let j = 0; j < dimenzije.kolone; j++) {
      const kartica = document.createElement('div');
      kartica.className = 'kartica';
      kartica.setAttribute('data-emodzi', promesanaTabla[i * dimenzije.kolone + j]);
      kartica.addEventListener('click', okreniKarticu);
      red.appendChild(kartica);
    }
    
    tablaIgre.appendChild(red);
  }
}

function dohvatiDimenzije() {
  switch (izabraniNivo) {
    case 'lako':
      return { redovi: 4, kolone: 4 };
    case 'srednje':
      return { redovi: 6, kolone: 6 };
    case 'tesko':
      return { redovi: 8, kolone: 8 };
    case 'ekspert':
      return { redovi: 10, kolone: 10 };
  }
}

function promešajNiz(niz) {
  for (let i = niz.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [niz[i], niz[j]] = [niz[j], niz[i]];
  }
  return niz;
}

function sacuvajKorisnickoIme() {
  let korisnickoImeInput = document.getElementById("korisnicko-ime");
  let korisnickoIme = korisnickoImeInput.value.trim();

  if (korisnickoIme !== "" && korisnickoIme !== null) {
    localStorage.setItem("korisnickoIme", korisnickoIme);
    generisiIgru();
    pokreniTajmer();
  } else {
    alert("Unesite pravilno korisničko ime!");
    clearInterval(intervalTajmera);
  }
}

function pokreniTajmer() {
  clearInterval(intervalTajmera);
  protekloVreme = 0;
  azurirajPrikazTajmera();

  intervalTajmera = setInterval(() => {
    protekloVreme++;
    azurirajPrikazTajmera();
  }, 1000);
}

function azurirajPrikazTajmera() {
  const elementTajmera = document.getElementById('brojac');
  elementTajmera.innerText = `Vreme: ${protekloVreme}s`;
  localStorage.setItem("protekloVreme", protekloVreme);
}

let okrenuteKartice = [];
let mozeOkretanje = true;

function okreniKarticu() {
  if (!mozeOkretanje) return;
  
  const kartica = this;

  if (kartica.classList.contains('okrenuta')) {
    return;
  }

  kartica.textContent = kartica.getAttribute('data-emodzi');
  kartica.classList.add('okrenuta');
  okrenuteKartice.push(kartica);

  kartica.addEventListener('click', okreniKarticu);
  if (okrenuteKartice.length === 2) {
    mozeOkretanje = false;
    setTimeout(proveriPodudaranje, 600);
  }
}

function proveriPodudaranje() {
  const [kartica1, kartica2] = okrenuteKartice;

  if (kartica1.getAttribute('data-emodzi') === kartica2.getAttribute('data-emodzi')) {
    kartica1.classList.add('poklapajuca');
    kartica2.classList.add('poklapajuca');

    if (document.querySelectorAll('.kartica:not(.poklapajuca)').length === 0) {
      const potvrda = confirm(`Čestitamo! Pobedili ste na nivou: ${izabraniNivo}. Želite li nastaviti sa igrom?`);

      if (potvrda) {
        upisiRezultate();
        generisiIgru(izabraniNivo);
        pokreniTajmer()
        prikaziRezultateZaNivo(izabraniNivo);
      } else {
        clearInterval(intervalTajmera);
        alert(`Igra završena! Vaše vreme: ${protekloVreme}s`);
        upisiRezultate();
        prikaziRezultateZaNivo(izabraniNivo);
      }
  }

  } else {
    kartica1.textContent = '';
    kartica2.textContent = '';
    kartica1.classList.remove('okrenuta');
    kartica2.classList.remove('okrenuta');
  }
  okrenuteKartice = [];
  mozeOkretanje = true;
}

function prikaziRezultateZaNivo(nivo) {
  const tabelaPodaci = JSON.parse(localStorage.getItem("tabelaPodaci")) || [];
  const filtriraniPodaci = tabelaPodaci.filter(podatak => podatak.tezina === nivo);
  filtriraniPodaci.sort((a, b) => a.vreme - b.vreme);
  const top5Podaci = filtriraniPodaci.slice(0, 5);

  generisiIPrikaziTabelu(top5Podaci);
}

function upisiRezultate() {
  const korisnickoIme = localStorage.getItem("korisnickoIme");
  const protekloVreme = localStorage.getItem("protekloVreme");
  const izabraniNivo = localStorage.getItem("izabraniNivo");

  const tabelaPodaci = JSON.parse(localStorage.getItem("tabelaPodaci")) || [];
  tabelaPodaci.push({ tezina: izabraniNivo, korisnickoIme, vreme: protekloVreme });
  tabelaPodaci.sort((a, b) => a.vreme - b.vreme);
  localStorage.setItem("tabelaPodaci", JSON.stringify(tabelaPodaci));
}

function generisiIPrikaziTabelu(podaci) {
  const tabelaIgre = document.getElementById('rezultati');
  tabelaIgre.innerHTML = '';  
  
  const tabela = document.createElement("table");
  tabela.innerHTML = `
    <tr>
      <th>Mesto</th>
      <th>Korisničko Ime</th>
      <th>Vreme</th>
    </tr>
  `;

  for (let i = 0; i < podaci.length; i++) {
    const red = tabela.insertRow();
    const celijaMesto = red.insertCell(0);
    const celijaKorisnickoIme = red.insertCell(1);
    const celijaVreme = red.insertCell(2);

    celijaMesto.textContent = i + 1;
    celijaKorisnickoIme.textContent = podaci[i].korisnickoIme;
    celijaVreme.textContent = podaci[i].vreme + ` s`;
  }
  tabelaIgre.append(tabela);
}