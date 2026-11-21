// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const updateCurrentUserInput = validate194;
const schema256 = {
  type: 'object',
  properties: {
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/UpdateProfileRequest',
    },
  },
  required: ['body'],
  $id: 'https://edition.invalid/validators/updateCurrentUserInput',
};
const schema257 = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    locale: { type: 'string' },
    avatar: { type: 'string' },
  },
  required: ['name'],
};
const func1 = ucs2Length;
function validate194(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/updateCurrentUserInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate194.evaluated;
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
              'https://edition.invalid/control#/components/schemas/UpdateProfileRequest/required',
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
        if (data0.name !== undefined) {
          let data1 = data0.name;
          if (typeof data1 === 'string') {
            if (func1(data1) < 1) {
              const err2 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/UpdateProfileRequest/properties/name/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
          } else {
            const err3 = {
              instancePath: instancePath + '/body/name',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/UpdateProfileRequest/properties/name/type',
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
        if (data0.locale !== undefined) {
          if (typeof data0.locale !== 'string') {
            const err4 = {
              instancePath: instancePath + '/body/locale',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/UpdateProfileRequest/properties/locale/type',
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
        if (data0.avatar !== undefined) {
          if (typeof data0.avatar !== 'string') {
            const err5 = {
              instancePath: instancePath + '/body/avatar',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/UpdateProfileRequest/properties/avatar/type',
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
      } else {
        const err6 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/UpdateProfileRequest/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
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
      instancePath,
      schemaPath: '#/type',
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
  validate194.errors = vErrors;
  return errors === 0;
}
validate194.evaluated = {
  props: { body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const updateCurrentUserOutput = validate195;
const schema258 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Profile',
  $id: 'https://edition.invalid/validators/updateCurrentUserOutput',
};
const schema243 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string' },
    name: { type: 'string' },
    avatar: { type: 'string' },
    locale: { type: 'string' },
    verified: { type: 'boolean' },
    status: { type: 'string' },
    platformOperator: { type: 'boolean' },
    tenants: {
      type: 'array',
      items: { $ref: '#/components/schemas/TenantMembership' },
    },
  },
};
const schema244 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    role: { type: 'string' },
    status: { type: 'string' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate196(
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
  const evaluated0 = validate196.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.email !== undefined) {
      if (typeof data.email !== 'string') {
        const err2 = {
          instancePath: instancePath + '/email',
          schemaPath: '#/properties/email/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err3 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.avatar !== undefined) {
      if (typeof data.avatar !== 'string') {
        const err4 = {
          instancePath: instancePath + '/avatar',
          schemaPath: '#/properties/avatar/type',
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
    if (data.locale !== undefined) {
      if (typeof data.locale !== 'string') {
        const err5 = {
          instancePath: instancePath + '/locale',
          schemaPath: '#/properties/locale/type',
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
    if (data.verified !== undefined) {
      if (typeof data.verified !== 'boolean') {
        const err6 = {
          instancePath: instancePath + '/verified',
          schemaPath: '#/properties/verified/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err7 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
    if (data.platformOperator !== undefined) {
      if (typeof data.platformOperator !== 'boolean') {
        const err8 = {
          instancePath: instancePath + '/platformOperator',
          schemaPath: '#/properties/platformOperator/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.tenants !== undefined) {
      let data8 = data.tenants;
      if (Array.isArray(data8)) {
        const len0 = data8.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data9 = data8[i0];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.id !== undefined) {
              let data10 = data9.id;
              if (typeof data10 === 'string') {
                if (!formats0.test(data10)) {
                  const err9 = {
                    instancePath: instancePath + '/tenants/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/TenantMembership/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err9];
                  } else {
                    vErrors.push(err9);
                  }
                  errors++;
                }
              } else {
                const err10 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/TenantMembership/properties/id/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            if (data9.name !== undefined) {
              if (typeof data9.name !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/TenantMembership/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data9.role !== undefined) {
              if (typeof data9.role !== 'string') {
                const err12 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/role',
                  schemaPath:
                    '#/components/schemas/TenantMembership/properties/role/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data9.status !== undefined) {
              if (typeof data9.status !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/TenantMembership/properties/status/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/tenants/' + i0,
              schemaPath: '#/components/schemas/TenantMembership/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
      } else {
        const err15 = {
          instancePath: instancePath + '/tenants',
          schemaPath: '#/properties/tenants/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate196.errors = vErrors;
  return errors === 0;
}
validate196.evaluated = {
  props: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    locale: true,
    verified: true,
    status: true,
    platformOperator: true,
    tenants: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate195(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/updateCurrentUserOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate195.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate196(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate196.errors
        : vErrors.concat(validate196.errors);
    errors = vErrors.length;
  }
  validate195.errors = vErrors;
  return errors === 0;
}
validate195.evaluated = {
  props: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    locale: true,
    verified: true,
    status: true,
    platformOperator: true,
    tenants: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const updateCurrentUserOutputFull = validate198;
const schema261 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Profile',
  $id: 'https://edition.invalid/validators/updateCurrentUserOutputFull',
};
function validate199(
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
  const evaluated0 = validate199.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.email !== undefined) {
      if (typeof data.email !== 'string') {
        const err2 = {
          instancePath: instancePath + '/email',
          schemaPath: '#/properties/email/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err3 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.avatar !== undefined) {
      if (typeof data.avatar !== 'string') {
        const err4 = {
          instancePath: instancePath + '/avatar',
          schemaPath: '#/properties/avatar/type',
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
    if (data.locale !== undefined) {
      if (typeof data.locale !== 'string') {
        const err5 = {
          instancePath: instancePath + '/locale',
          schemaPath: '#/properties/locale/type',
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
    if (data.verified !== undefined) {
      if (typeof data.verified !== 'boolean') {
        const err6 = {
          instancePath: instancePath + '/verified',
          schemaPath: '#/properties/verified/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err7 = {
          instancePath: instancePath + '/status',
          schemaPath: '#/properties/status/type',
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
    if (data.platformOperator !== undefined) {
      if (typeof data.platformOperator !== 'boolean') {
        const err8 = {
          instancePath: instancePath + '/platformOperator',
          schemaPath: '#/properties/platformOperator/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.tenants !== undefined) {
      let data8 = data.tenants;
      if (Array.isArray(data8)) {
        const len0 = data8.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data9 = data8[i0];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.id !== undefined) {
              let data10 = data9.id;
              if (typeof data10 === 'string') {
                if (!formats0.test(data10)) {
                  const err9 = {
                    instancePath: instancePath + '/tenants/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/TenantMembership/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err9];
                  } else {
                    vErrors.push(err9);
                  }
                  errors++;
                }
              } else {
                const err10 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/TenantMembership/properties/id/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            if (data9.name !== undefined) {
              if (typeof data9.name !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/TenantMembership/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data9.role !== undefined) {
              if (typeof data9.role !== 'string') {
                const err12 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/role',
                  schemaPath:
                    '#/components/schemas/TenantMembership/properties/role/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data9.status !== undefined) {
              if (typeof data9.status !== 'string') {
                const err13 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/TenantMembership/properties/status/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/tenants/' + i0,
              schemaPath: '#/components/schemas/TenantMembership/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
      } else {
        const err15 = {
          instancePath: instancePath + '/tenants',
          schemaPath: '#/properties/tenants/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate199.errors = vErrors;
  return errors === 0;
}
validate199.evaluated = {
  props: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    locale: true,
    verified: true,
    status: true,
    platformOperator: true,
    tenants: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate198(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/updateCurrentUserOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate198.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate199(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate199.errors
        : vErrors.concat(validate199.errors);
    errors = vErrors.length;
  }
  validate198.errors = vErrors;
  return errors === 0;
}
validate198.evaluated = {
  props: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    locale: true,
    verified: true,
    status: true,
    platformOperator: true,
    tenants: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
