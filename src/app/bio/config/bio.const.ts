import { Finger } from '../models/finger.model';
import { BioStatus } from '../models/bio.status';
import { environment } from 'src/environments/environment';
import { BiomatchConfig } from '../models/biomatch.model';

export class BioConst {
  static getInfoPath = `${environment.gategay_path}/biometria/biogateway/huella`;
  static verifyPath = `${environment.gategay_path}/biometria/biogateway/huella/valida`;
  static wininfoPath  = '/uxagent/api/user';
  static biomatchPath = '/biomatch';
  static defaultMaxIntent = 4;
  static defaultTimeoutAgent = 15000;
  static defaultTimeoutCheckBiomatch = 15000;
  static defaultTimeoutBioGateway = 30000;
  static defaultTimeoutClosePopup = 4000;
  static defaultTimeoutNative = 35000;
  static defaultTimeoutBiomatch = 30000;
  static defaultTimeValidationInSeconds = 30;
  static biomatchConfig: BiomatchConfig = {
    width: '256',
    height: '394',
    imgFlag: '2',
    idFinger: '2',
    umbral: '80',
    timeout: '15',
    token : '0',
    visible: '0',
    response: '444',
  };
  static fingers: Finger[] = [
    { number: '1', name: 'PULGAR DERECHO', imageName: '/bio/finger_1.png' },
    { number: '2', name: 'ÍNDICE DERECHO', imageName: '/bio/finger_2.png' },
    { number: '3', name: 'MEDIO DERECHO', imageName: '/bio/finger_3.png' },
    { number: '4', name: 'ANULAR DERECHO', imageName: '/bio/finger_4.png' },
    { number: '5', name: 'MEÑIQUE DERECHO', imageName: '/bio/finger_5.png' },
    { number: '6', name: 'PULGAR IZQUIERDO', imageName: '/bio/finger_6.png' },
    { number: '7', name: 'ÍNDICE IZQUIERDO', imageName: '/bio/finger_7.png' },
    { number: '8', name: 'MEDIO IZQUIERDO', imageName: '/bio/finger_8.png' },
    { number: '9', name: 'ANULAR IZQUIERDO', imageName: '/bio/finger_9.png' },
    { number: '10', name: 'MEÑIQUE IZQUIERDO', imageName: '/bio/finger_10.png' },
  ];
  static biomatchStatus: BioStatus[] = [
    { isError: true, code: '19065', description: 'Ocurrió un error vuelva a intentarlo'},
    { isError: true, code: '19014', description: 'El lector de huella requiere limpieza o se cancelo la captura de la huella'},
    { isError: true, code: '19015', description: 'El lector de huella está desconectado o no se detecta'},
    { isError: true, code: '19017', description: 'Ha superado el tiempo de espera para la captura de la huella'},
    { isError: true, code: '19058', description: 'El dedo esta demasiado húmedo'},
    { isError: true,  code: '19036', description: 'Posible dedo falso detectado'},
    { isError: false, code : '19000' },
    { isError: false, code : '19002' },
    { isError: false, code : '19004' },
    { isError: false, code : '19005' },
    { isError: false, code : '19006' },
    { isError: false, code : '19035' },
    { isError: false, code : '19060' },
    { isError: false, code : '19064' },
  ];
  static bioGateyayStatus: BioStatus[] = [
    { isError: false, code: '8000', description: 'Todas las operaciones se efectuaron correctamente.'},
    { isError: false, code: '8027', description: 'Todas las operaciones se efectuaron.'},
    { isError: true, code: '8001', description: '¡No se encontraron datos del cliente!' },
    { isError: true, code: '8082', description: 'Ocurrió una excepcion en los servicios de biometría' },
    { isError: true, code: '8015', description: '¡Posible dedo Falso!' },
    { isError: true, code: '8003', description: '¡Ocurrió un error al intentar conectar al webservice!' },
    { isError: true, code: '8004', description: '¡Ocurrió un error al intentar conectar al webservice de RENIEC!' },
    { isError: false, code: '8002' },
  ];

  static reniecStatus: BioStatus[] =  [
    { isError: true, code: '70007', description: '¡NO HIT: NO es posible identificar a la persona!'},
    { isError: true, code: '301', description: 'El usuario autorizador no existe' },
    { isError: true, code: '313', description: 'Error no mapeado.' },
    { isError: true, code: '308', description: 'El DNI del ciudadano no es válido.' },
    { isError: true, code: '70019', description: 'Error no mapeado.' },
    { isError: false, code: '70006', description: 'Se ha realizado HIT de la persona!'},
  ];

  static messageResponse = {
    TIMEOUT_BIOMATCH: 'El agente Biomatch Client no respondió en el tiempo esperado.',
    TIMEOUT_BIOGATEGAY: 'El servicio de Biometría no respondió en el tiempo esperado.',
    NODEVICE: 'El dispositivo biométrico no está conectado, por favor verificar.',
    TIMEOUT_AGENT: 'El agent UXRF no respondió en el tiempo esperado.',
    OPERATION_CANCELLED: 'El proceso de validación biométrico a sido cancelado.',
    HTTP_ERROR_RESPONSE: 'Ha ocurrido un error en la respuesta de los servicios biométricos',
    UNKNOW_ERROR: 'Ha ocurrido un error desconocido',
    BIOMATCH_CHECK_ERROR: 'Ha ocurrido un error al verificar Biomatch.'
  };
}

