/* baby-illustration.js — ilustrasi janin 3D yang menyesuaikan usia (minggu).
   Menyediakan global babyStage(w) & babySVG(w). TIDAK menyentuh DOM saat dimuat.
   Murni presentasi — tidak mengubah logika/hasil kalkulator apa pun. */
(function(){
  function babyStage(w){ return w<=7?1:w<=12?2:w<=19?3:w<=27?4:w<=35?5:6; }
  var DEFS = '<defs>'
    + '<radialGradient id="sk3" cx="38%" cy="30%" r="78%"><stop offset="0%" stop-color="#ffe6d6"/><stop offset="45%" stop-color="#f6bfa3"/><stop offset="100%" stop-color="#cf8466"/></radialGradient>'
    + '<radialGradient id="sk3d" cx="40%" cy="32%" r="72%"><stop offset="0%" stop-color="#ffd9c4"/><stop offset="100%" stop-color="#c47a5c"/></radialGradient>'
    + '<radialGradient id="chk" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff9d8a" stop-opacity=".6"/><stop offset="100%" stop-color="#ff9d8a" stop-opacity="0"/></radialGradient>'
    + '<linearGradient id="hr3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5630"/><stop offset="1" stop-color="#5d3720"/></linearGradient>'
    + '</defs>';
  function H(x,y,rx,ry,o){ return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#fff" opacity="'+(o==null?0.3:o)+'"/>'; }
  function body(w){
    var s = babyStage(w);
    var g = (0.62 + 0.38*((w-4)/36)).toFixed(3);   // pertumbuhan halus per minggu
    var ground = '<ellipse cx="60" cy="142" rx="'+(26+s*1.6).toFixed(1)+'" ry="6" fill="#000" opacity=".12"/>';
    var inner = '';
    if(s===1){ // embrio 4-7 mg: kepala besar, tubuh melengkung, ekor, tunas tungkai
      inner = '<circle cx="58" cy="46" r="20" fill="url(#sk3)"/>'
        + '<ellipse cx="55" cy="80" rx="15" ry="19" transform="rotate(-18 55 80)" fill="url(#sk3)"/>'
        + '<path d="M48 95 C42 103 38 107 34 105 C39 101 43 97 47 92 Z" fill="url(#sk3d)"/>'
        + '<ellipse cx="67" cy="72" rx="6" ry="4" transform="rotate(25 67 72)" fill="url(#sk3d)"/>'
        + '<ellipse cx="63" cy="90" rx="6" ry="4" transform="rotate(15 63 90)" fill="url(#sk3d)"/>'
        + H(51,40,7,5) + H(50,74,4,7,0.22);
    } else if(s===2){ // 8-12 mg: tungkai seperti dayung, mata titik
      inner = '<ellipse cx="58" cy="82" rx="15" ry="22" transform="rotate(-8 58 82)" fill="url(#sk3)"/>'
        + '<ellipse cx="73" cy="72" rx="8" ry="4.5" transform="rotate(35 73 72)" fill="url(#sk3d)"/>'
        + '<ellipse cx="71" cy="99" rx="8" ry="4.5" transform="rotate(20 71 99)" fill="url(#sk3d)"/>'
        + '<circle cx="58" cy="44" r="19" fill="url(#sk3)"/>'
        + '<circle cx="52" cy="44" r="1.8" fill="#5b3a29"/>'
        + H(51,38,7,5) + H(52,76,4,8,0.2);
    } else if(s===3){ // 13-19 mg: jari, hidung, pipi samar
      inner = '<ellipse cx="58" cy="86" rx="16" ry="24" fill="url(#sk3)"/>'
        + '<ellipse cx="75" cy="80" rx="6" ry="11" transform="rotate(15 75 80)" fill="url(#sk3d)"/>'
        + '<circle cx="79" cy="90" r="3.6" fill="url(#sk3d)"/>'
        + '<ellipse cx="70" cy="106" rx="7" ry="12" transform="rotate(8 70 106)" fill="url(#sk3d)"/>'
        + '<ellipse cx="72" cy="116" rx="4.5" ry="3.2" fill="url(#sk3d)"/>'
        + '<circle cx="58" cy="42" r="18" fill="url(#sk3)"/>'
        + '<ellipse cx="52" cy="42" rx="2" ry="2.6" fill="#5b3a29"/>'
        + '<circle cx="50" cy="49" r="5" fill="url(#chk)"/>'
        + '<path d="M57 45 q2 2 0 4" stroke="#cf8466" stroke-width="1.2" fill="none"/>'
        + H(51,36,7,5) + H(52,80,5,9,0.2);
    } else if(s===4){ // 20-27 mg: rambut tipis, proporsi membaik
      inner = '<ellipse cx="58" cy="88" rx="17" ry="26" fill="url(#sk3)"/>'
        + '<ellipse cx="76" cy="82" rx="6.5" ry="12" transform="rotate(15 76 82)" fill="url(#sk3d)"/>'
        + '<circle cx="80" cy="93" r="3.8" fill="url(#sk3d)"/>'
        + '<ellipse cx="70" cy="110" rx="7.5" ry="13" transform="rotate(8 70 110)" fill="url(#sk3d)"/>'
        + '<ellipse cx="72" cy="121" rx="4.8" ry="3.4" fill="url(#sk3d)"/>'
        + '<circle cx="58" cy="41" r="17" fill="url(#sk3)"/>'
        + '<path d="M44 33 q6 -8 14 -7 M50 30 q6 -7 13 -5 M57 30 q6 -5 11 -2" stroke="url(#hr3)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>'
        + '<ellipse cx="52" cy="41" rx="2" ry="2.6" fill="#5b3a29"/>'
        + '<circle cx="50" cy="48" r="6" fill="url(#chk)"/>'
        + '<path d="M57 44 q2 2 0 4" stroke="#cf8466" stroke-width="1.2" fill="none"/>'
        + H(51,35,6,4) + H(52,82,5,10,0.2);
    } else if(s===5){ // 28-35 mg: lebih berisi, meringkuk, mata terpejam
      inner = '<ellipse cx="58" cy="90" rx="20" ry="27" fill="url(#sk3)"/>'
        + '<ellipse cx="74" cy="86" rx="7" ry="13" transform="rotate(22 74 86)" fill="url(#sk3d)"/>'
        + '<circle cx="72" cy="98" r="4" fill="url(#sk3d)"/>'
        + '<ellipse cx="66" cy="112" rx="9" ry="13" transform="rotate(-6 66 112)" fill="url(#sk3d)"/>'
        + '<circle cx="58" cy="40" r="17" fill="url(#sk3)"/>'
        + '<path d="M45 31 q6 -8 14 -7 M52 28 q6 -7 13 -4 M58 28 q6 -5 11 -1" stroke="url(#hr3)" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/>'
        + '<path d="M48 40 q4 3 8 0" stroke="#5b3a29" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
        + '<circle cx="49" cy="47" r="7" fill="url(#chk)"/>'
        + '<path d="M57 44 q2 2 0 4" stroke="#cf8466" stroke-width="1.2" fill="none"/>'
        + H(51,34,6,4) + H(52,84,6,11,0.2);
    } else { // 36-40 mg: bayi cukup bulan, pipi tembem, rambut, meringkuk
      inner = '<ellipse cx="58" cy="92" rx="22" ry="28" fill="url(#sk3)"/>'
        + '<ellipse cx="76" cy="88" rx="8" ry="14" transform="rotate(25 76 88)" fill="url(#sk3d)"/>'
        + '<circle cx="73" cy="101" r="4.4" fill="url(#sk3d)"/>'
        + '<ellipse cx="64" cy="116" rx="10" ry="14" transform="rotate(-8 64 116)" fill="url(#sk3d)"/>'
        + '<circle cx="58" cy="122" r="4.6" fill="url(#sk3d)"/>'
        + '<circle cx="56" cy="40" r="18" fill="url(#sk3)"/>'
        + '<path d="M40 34 C44 22 70 22 74 34 C70 30 60 28 56 28 C50 28 44 30 40 34 Z" fill="url(#hr3)"/>'
        + '<path d="M48 40 q4 3 8 0" stroke="#5b3a29" stroke-width="1.7" fill="none" stroke-linecap="round"/>'
        + '<path d="M60 40 q4 3 8 0" stroke="#5b3a29" stroke-width="1.7" fill="none" stroke-linecap="round"/>'
        + '<circle cx="48" cy="47" r="8" fill="url(#chk)"/>'
        + '<circle cx="66" cy="47" r="6" fill="url(#chk)"/>'
        + '<path d="M55 49 q3 3 6 0" stroke="#c9607a" stroke-width="1.4" fill="none" stroke-linecap="round"/>'
        + H(50,33,7,5,0.35) + H(52,86,7,12,0.22);
    }
    return ground + '<g transform="translate(60 75) scale('+g+') translate(-60 -75)">' + inner + '</g>';
  }
  window.babyStage = babyStage;
  window.babySVG = function(w){
    return '<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi janin usia '+w+' minggu">' + DEFS + body(w) + '</svg>';
  };
})();