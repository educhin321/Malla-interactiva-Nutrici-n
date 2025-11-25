// ============================================
// script.js — COMPLETO Y COMPATIBLE
// ============================================

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let mapaCursos = {};
let estado = JSON.parse(localStorage.getItem("estadoCursos") || "{}");

const ramas = {
  "rama-ciencias":[
    "BIOLOGÍA","QUÍMICA GENERAL","QUÍMICA ORGÁNICA",
    "BIOQUÍMICA APLICADA A LA NUTRICIÓN","BIOQUÍMICA ALIMENTARIA",
    "BROMATOLOGÍA DE LOS ALIMENTOS",
    "MICROBIOLOGÍA Y PARASITOLOGÍA APLICADA A LA NUTRICIÓN",
    "FISIOPATOLOGÍA DE LA NUTRICIÓN","TOXICOLOGÍA ALIMENTARIA",
    "FOOD TECHNOLOGY"
  ],
  "rama-nutricion":[
    "INTRODUCCIÓN A LA NUTRICIÓN Y VIDA SALUDABLE",
    "FUNDAMENTOS DE LA SALUD: MACRO Y MICRONUTRIENTES",
    "NUTRICIÓN EN ETAPAS FISIOLÓGICAS",
    "VALORACIÓN NUTRICIONAL EN ETAPAS DE LA VIDA",
    "DIETÉTICA Y PROGRAM
