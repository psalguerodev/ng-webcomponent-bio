import { Finger } from '../models/finger.model';

export class BioConst {
  static getInfoPath = '/ibk/uat/biometria/biogateway/huella';
  static wininfoPath  = '/uxagent/api/user';
  static verifyPath = '/ibk/uat/biometria/biogateway/huella/valida';
  static biomatchPath = '/biomatch';
  static fingers: Finger[] = [
    { number: '1', name: 'PULGAR DERECHO'},
    { number: '2', name: 'ÍNDICE DERECHO'},
    { number: '3', name: 'MEDIO DERECHO'},
    { number: '4', name: 'ANULAR DERECHO'},
    { number: '5', name: 'MEÑIQUE DERECHO'},
    { number: '6', name: 'PULGAR IZQUIERDO'},
    { number: '7', name: 'ÍNDICE IZQUIERDO'},
    { number: '8', name: 'MEDIO IZQUIERDO'},
    { number: '9', name: 'ANULAR IZQUIERDO'},
    { number: '10', name: 'MEÑIQUE IZQUIERDO'},
  ];
}

