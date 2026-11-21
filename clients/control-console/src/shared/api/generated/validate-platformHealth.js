// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const platformHealthInput = validate1482;
const schema1628 = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: [],
  $id: 'https://edition.invalid/validators/platformHealthInput',
};
const func1 = ucs2Length;
function validate1482(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/platformHealthInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1482.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.query !== undefined) {
      let data0 = data.query;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.fields !== undefined) {
          let data1 = data0.fields;
          if (typeof data1 === 'string') {
            if (func1(data1) > 4096) {
              const err0 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
            if (func1(data1) < 1) {
              const err1 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
            }
          } else {
            const err2 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err2];
            } else {
              vErrors.push(err2);
            }
            errors++;
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
  }
  validate1482.errors = vErrors;
  return errors === 0;
}
validate1482.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const platformHealthOutput = validate1483;
const schema1629 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/HealthReport',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialHealthReport',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/platformHealthOutput',
};
const schema1630 = {
  type: 'object',
  properties: {
    checkedAt: { type: 'string', format: 'date-time' },
    services: {
      type: 'array',
      items: { $ref: '#/components/schemas/HealthService' },
    },
  },
};
const formats10 = fullFormats['date-time'];
const schema1631 = {
  type: 'object',
  properties: {
    service: { type: 'string' },
    status: { type: 'string' },
    instances: {
      type: 'array',
      items: { $ref: '#/components/schemas/HealthInstance' },
    },
    details: { type: 'object', additionalProperties: {} },
  },
};
const schema1632 = {
  type: 'object',
  properties: {
    instance: { type: 'string' },
    version: { type: 'string' },
    seenAt: { type: 'string', format: 'date-time' },
    status: { type: 'string' },
    details: { type: 'object', additionalProperties: {} },
  },
};
function validate1485(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1485.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.service !== undefined) {
      if (typeof data.service !== 'string') {
        const err0 = {
          instancePath: instancePath + '/service',
          schemaPath: '#/properties/service/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err1 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.instances !== undefined) {
      let data2 = data.instances;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
            if (data3.instance !== undefined) {
              if (typeof data3.instance !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/instances/' + i0 + '/instance',
                  schemaPath:
                    '#/components/schemas/HealthInstance/properties/instance/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
            if (data3.version !== undefined) {
              if (typeof data3.version !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/instances/' + i0 + '/version',
                  schemaPath:
                    '#/components/schemas/HealthInstance/properties/version/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }
                errors++;
              }
            }
            if (data3.seenAt !== undefined) {
              let data6 = data3.seenAt;
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err4 = {
                    instancePath: instancePath + '/instances/' + i0 + '/seenAt',
                    schemaPath:
                      '#/components/schemas/HealthInstance/properties/seenAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err4];
                  } else {
                    vErrors.push(err4);
                  }
                  errors++;
                }
              } else {
                const err5 = {
                  instancePath: instancePath + '/instances/' + i0 + '/seenAt',
                  schemaPath:
                    '#/components/schemas/HealthInstance/properties/seenAt/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err5];
                } else {
                  vErrors.push(err5);
                }
                errors++;
              }
            }
            if (data3.status !== undefined) {
              if (typeof data3.status !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/instances/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/HealthInstance/properties/status/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data3.details !== undefined) {
              let data8 = data3.details;
              if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
              } else {
                const err7 = {
                  instancePath: instancePath + '/instances/' + i0 + '/details',
                  schemaPath:
                    '#/components/schemas/HealthInstance/properties/details/type',
                  keyword: 'type',
                  params: { type: 'object' },
                  message: 'must be object',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
          } else {
            const err8 = {
              instancePath: instancePath + '/instances/' + i0,
              schemaPath: '#/components/schemas/HealthInstance/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err8];
            } else {
              vErrors.push(err8);
            }
            errors++;
          }
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/instances',
          schemaPath: '#/properties/instances/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.details !== undefined) {
      let data9 = data.details;
      if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
      } else {
        const err10 = {
          instancePath: instancePath + '/details',
          schemaPath: '#/properties/details/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate1485.errors = vErrors;
  return errors === 0;
}
validate1485.evaluated = {
  props: { service: true, status: true, instances: true, details: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1484(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1484.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.checkedAt !== undefined) {
      let data0 = data.checkedAt;
      if (typeof data0 === 'string') {
        if (!formats10.validate(data0)) {
          const err0 = {
            instancePath: instancePath + '/checkedAt',
            schemaPath: '#/properties/checkedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/checkedAt',
          schemaPath: '#/properties/checkedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.services !== undefined) {
      let data1 = data.services;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1485(data1[i0], {
              instancePath: instancePath + '/services/' + i0,
              parentData: data1,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1485.errors
                : vErrors.concat(validate1485.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err2 = {
          instancePath: instancePath + '/services',
          schemaPath: '#/properties/services/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate1484.errors = vErrors;
  return errors === 0;
}
validate1484.evaluated = {
  props: { checkedAt: true, services: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1633 = {
  type: 'object',
  properties: {
    checkedAt: { type: 'string', format: 'date-time' },
    services: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialHealthService' },
    },
  },
};
const schema1634 = {
  type: 'object',
  properties: {
    service: { type: 'string' },
    status: { type: 'string' },
    instances: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialHealthInstance' },
    },
    details: { type: 'object', additionalProperties: {} },
  },
};
const schema1635 = {
  type: 'object',
  properties: {
    instance: { type: 'string' },
    version: { type: 'string' },
    seenAt: { type: 'string', format: 'date-time' },
    status: { type: 'string' },
    details: { type: 'object', additionalProperties: {} },
  },
};
function validate1489(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1489.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.service !== undefined) {
      if (typeof data.service !== 'string') {
        const err0 = {
          instancePath: instancePath + '/service',
          schemaPath: '#/properties/service/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err1 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.instances !== undefined) {
      let data2 = data.instances;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
            if (data3.instance !== undefined) {
              if (typeof data3.instance !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/instances/' + i0 + '/instance',
                  schemaPath:
                    '#/components/schemas/PartialHealthInstance/properties/instance/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
            if (data3.version !== undefined) {
              if (typeof data3.version !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/instances/' + i0 + '/version',
                  schemaPath:
                    '#/components/schemas/PartialHealthInstance/properties/version/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }
                errors++;
              }
            }
            if (data3.seenAt !== undefined) {
              let data6 = data3.seenAt;
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err4 = {
                    instancePath: instancePath + '/instances/' + i0 + '/seenAt',
                    schemaPath:
                      '#/components/schemas/PartialHealthInstance/properties/seenAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err4];
                  } else {
                    vErrors.push(err4);
                  }
                  errors++;
                }
              } else {
                const err5 = {
                  instancePath: instancePath + '/instances/' + i0 + '/seenAt',
                  schemaPath:
                    '#/components/schemas/PartialHealthInstance/properties/seenAt/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err5];
                } else {
                  vErrors.push(err5);
                }
                errors++;
              }
            }
            if (data3.status !== undefined) {
              if (typeof data3.status !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/instances/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialHealthInstance/properties/status/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data3.details !== undefined) {
              let data8 = data3.details;
              if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
              } else {
                const err7 = {
                  instancePath: instancePath + '/instances/' + i0 + '/details',
                  schemaPath:
                    '#/components/schemas/PartialHealthInstance/properties/details/type',
                  keyword: 'type',
                  params: { type: 'object' },
                  message: 'must be object',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
          } else {
            const err8 = {
              instancePath: instancePath + '/instances/' + i0,
              schemaPath: '#/components/schemas/PartialHealthInstance/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err8];
            } else {
              vErrors.push(err8);
            }
            errors++;
          }
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/instances',
          schemaPath: '#/properties/instances/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.details !== undefined) {
      let data9 = data.details;
      if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
      } else {
        const err10 = {
          instancePath: instancePath + '/details',
          schemaPath: '#/properties/details/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate1489.errors = vErrors;
  return errors === 0;
}
validate1489.evaluated = {
  props: { service: true, status: true, instances: true, details: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1488(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1488.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.checkedAt !== undefined) {
      let data0 = data.checkedAt;
      if (typeof data0 === 'string') {
        if (!formats10.validate(data0)) {
          const err0 = {
            instancePath: instancePath + '/checkedAt',
            schemaPath: '#/properties/checkedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/checkedAt',
          schemaPath: '#/properties/checkedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.services !== undefined) {
      let data1 = data.services;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1489(data1[i0], {
              instancePath: instancePath + '/services/' + i0,
              parentData: data1,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1489.errors
                : vErrors.concat(validate1489.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err2 = {
          instancePath: instancePath + '/services',
          schemaPath: '#/properties/services/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate1488.errors = vErrors;
  return errors === 0;
}
validate1488.evaluated = {
  props: { checkedAt: true, services: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1483(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/platformHealthOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1483.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate1484(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1484.errors
        : vErrors.concat(validate1484.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.checkedAt = true;
    props0.services = true;
  }
  const _errs2 = errors;
  if (
    !validate1488(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1488.errors
        : vErrors.concat(validate1488.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.checkedAt = true;
      props0.services = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate1483.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1483.evaluated = { dynamicProps: true, dynamicItems: false };
export const platformHealthOutputFull = validate1492;
const schema1636 = {
  $ref: 'https://edition.invalid/control#/components/schemas/HealthReport',
  $id: 'https://edition.invalid/validators/platformHealthOutputFull',
};
function validate1493(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1493.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.checkedAt !== undefined) {
      let data0 = data.checkedAt;
      if (typeof data0 === 'string') {
        if (!formats10.validate(data0)) {
          const err0 = {
            instancePath: instancePath + '/checkedAt',
            schemaPath: '#/properties/checkedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/checkedAt',
          schemaPath: '#/properties/checkedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.services !== undefined) {
      let data1 = data.services;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1485(data1[i0], {
              instancePath: instancePath + '/services/' + i0,
              parentData: data1,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1485.errors
                : vErrors.concat(validate1485.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err2 = {
          instancePath: instancePath + '/services',
          schemaPath: '#/properties/services/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate1493.errors = vErrors;
  return errors === 0;
}
validate1493.evaluated = {
  props: { checkedAt: true, services: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1492(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/platformHealthOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1492.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1493(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1493.errors
        : vErrors.concat(validate1493.errors);
    errors = vErrors.length;
  }
  validate1492.errors = vErrors;
  return errors === 0;
}
validate1492.evaluated = {
  props: { checkedAt: true, services: true },
  dynamicProps: false,
  dynamicItems: false,
};
