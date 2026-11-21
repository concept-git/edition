// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const provisionTenantInput = validate781;
const schema895 = {
  type: 'object',
  properties: {
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/ProvisionTenantRequest',
    },
  },
  required: ['body'],
  $id: 'https://edition.invalid/validators/provisionTenantInput',
};
const schema896 = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    ownerEmail: { type: 'string', format: 'email', minLength: 1 },
  },
  required: ['name', 'ownerEmail'],
};
const func1 = ucs2Length;
const formats732 =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
function validate781(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/provisionTenantInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate781.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.body === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.body !== undefined) {
      let data0 = data.body;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.name === undefined) {
          const err1 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ProvisionTenantRequest/required',
            keyword: 'required',
            params: { missingProperty: 'name' },
            message: "must have required property '" + 'name' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.ownerEmail === undefined) {
          const err2 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ProvisionTenantRequest/required',
            keyword: 'required',
            params: { missingProperty: 'ownerEmail' },
            message: "must have required property '" + 'ownerEmail' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.name !== undefined) {
          let data1 = data0.name;
          if (typeof data1 === 'string') {
            if (func1(data1) < 1) {
              const err3 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ProvisionTenantRequest/properties/name/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          } else {
            const err4 = {
              instancePath: instancePath + '/body/name',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ProvisionTenantRequest/properties/name/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
        if (data0.ownerEmail !== undefined) {
          let data2 = data0.ownerEmail;
          if (typeof data2 === 'string') {
            if (func1(data2) < 1) {
              const err5 = {
                instancePath: instancePath + '/body/ownerEmail',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ProvisionTenantRequest/properties/ownerEmail/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (!formats732.test(data2)) {
              const err6 = {
                instancePath: instancePath + '/body/ownerEmail',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ProvisionTenantRequest/properties/ownerEmail/format',
                keyword: 'format',
                params: { format: 'email' },
                message: 'must match format "' + 'email' + '"',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
          } else {
            const err7 = {
              instancePath: instancePath + '/body/ownerEmail',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ProvisionTenantRequest/properties/ownerEmail/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ProvisionTenantRequest/type',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate781.errors = vErrors;
  return errors === 0;
}
validate781.evaluated = {
  props: { body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const provisionTenantOutput = validate782;
const schema897 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Provisioned',
  $id: 'https://edition.invalid/validators/provisionTenantOutput',
};
const schema898 = {
  type: 'object',
  properties: {
    tenant: { $ref: '#/components/schemas/TenantView' },
    ownerInviteToken: { type: 'string' },
  },
};
const schema889 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    status: { type: 'string' },
    ownerCount: { type: 'integer', format: 'int64' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate783(
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
  const evaluated0 = validate783.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.tenant !== undefined) {
      let data0 = data.tenant;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err0 = {
                instancePath: instancePath + '/tenant/id',
                schemaPath:
                  '#/components/schemas/TenantView/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/tenant/id',
              schemaPath: '#/components/schemas/TenantView/properties/id/type',
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
        if (data0.name !== undefined) {
          if (typeof data0.name !== 'string') {
            const err2 = {
              instancePath: instancePath + '/tenant/name',
              schemaPath:
                '#/components/schemas/TenantView/properties/name/type',
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
        if (data0.status !== undefined) {
          if (typeof data0.status !== 'string') {
            const err3 = {
              instancePath: instancePath + '/tenant/status',
              schemaPath:
                '#/components/schemas/TenantView/properties/status/type',
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
        if (data0.ownerCount !== undefined) {
          let data4 = data0.ownerCount;
          if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
            const err4 = {
              instancePath: instancePath + '/tenant/ownerCount',
              schemaPath:
                '#/components/schemas/TenantView/properties/ownerCount/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
        if (data0.createdAt !== undefined) {
          let data5 = data0.createdAt;
          if (typeof data5 === 'string') {
            if (!formats10.validate(data5)) {
              const err5 = {
                instancePath: instancePath + '/tenant/createdAt',
                schemaPath:
                  '#/components/schemas/TenantView/properties/createdAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          } else {
            const err6 = {
              instancePath: instancePath + '/tenant/createdAt',
              schemaPath:
                '#/components/schemas/TenantView/properties/createdAt/type',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/tenant',
          schemaPath: '#/components/schemas/TenantView/type',
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
    if (data.ownerInviteToken !== undefined) {
      if (typeof data.ownerInviteToken !== 'string') {
        const err8 = {
          instancePath: instancePath + '/ownerInviteToken',
          schemaPath: '#/properties/ownerInviteToken/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate783.errors = vErrors;
  return errors === 0;
}
validate783.evaluated = {
  props: { tenant: true, ownerInviteToken: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate782(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/provisionTenantOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate782.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate783(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate783.errors
        : vErrors.concat(validate783.errors);
    errors = vErrors.length;
  }
  validate782.errors = vErrors;
  return errors === 0;
}
validate782.evaluated = {
  props: { tenant: true, ownerInviteToken: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const provisionTenantOutputFull = validate785;
const schema900 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Provisioned',
  $id: 'https://edition.invalid/validators/provisionTenantOutputFull',
};
function validate786(
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
  const evaluated0 = validate786.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.tenant !== undefined) {
      let data0 = data.tenant;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err0 = {
                instancePath: instancePath + '/tenant/id',
                schemaPath:
                  '#/components/schemas/TenantView/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/tenant/id',
              schemaPath: '#/components/schemas/TenantView/properties/id/type',
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
        if (data0.name !== undefined) {
          if (typeof data0.name !== 'string') {
            const err2 = {
              instancePath: instancePath + '/tenant/name',
              schemaPath:
                '#/components/schemas/TenantView/properties/name/type',
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
        if (data0.status !== undefined) {
          if (typeof data0.status !== 'string') {
            const err3 = {
              instancePath: instancePath + '/tenant/status',
              schemaPath:
                '#/components/schemas/TenantView/properties/status/type',
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
        if (data0.ownerCount !== undefined) {
          let data4 = data0.ownerCount;
          if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
            const err4 = {
              instancePath: instancePath + '/tenant/ownerCount',
              schemaPath:
                '#/components/schemas/TenantView/properties/ownerCount/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
        if (data0.createdAt !== undefined) {
          let data5 = data0.createdAt;
          if (typeof data5 === 'string') {
            if (!formats10.validate(data5)) {
              const err5 = {
                instancePath: instancePath + '/tenant/createdAt',
                schemaPath:
                  '#/components/schemas/TenantView/properties/createdAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          } else {
            const err6 = {
              instancePath: instancePath + '/tenant/createdAt',
              schemaPath:
                '#/components/schemas/TenantView/properties/createdAt/type',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/tenant',
          schemaPath: '#/components/schemas/TenantView/type',
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
    if (data.ownerInviteToken !== undefined) {
      if (typeof data.ownerInviteToken !== 'string') {
        const err8 = {
          instancePath: instancePath + '/ownerInviteToken',
          schemaPath: '#/properties/ownerInviteToken/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate786.errors = vErrors;
  return errors === 0;
}
validate786.evaluated = {
  props: { tenant: true, ownerInviteToken: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate785(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/provisionTenantOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate785.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate786(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate786.errors
        : vErrors.concat(validate786.errors);
    errors = vErrors.length;
  }
  validate785.errors = vErrors;
  return errors === 0;
}
validate785.evaluated = {
  props: { tenant: true, ownerInviteToken: true },
  dynamicProps: false,
  dynamicItems: false,
};
