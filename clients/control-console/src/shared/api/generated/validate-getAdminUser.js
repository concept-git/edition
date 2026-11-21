// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const getAdminUserInput = validate1473;
const schema1619 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { id: { type: 'string', format: 'uuid' } },
      required: ['id'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/getAdminUserInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1473(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/getAdminUserInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1473.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.path === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'path' },
        message: "must have required property '" + 'path' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id === undefined) {
          const err1 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'id' },
            message: "must have required property '" + 'id' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err2 = {
                instancePath: instancePath + '/path/id',
                schemaPath: '#/properties/path/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/id',
              schemaPath: '#/properties/path/properties/id/type',
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
      } else {
        const err4 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    }
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.fields !== undefined) {
          let data3 = data2.fields;
          if (typeof data3 === 'string') {
            if (func1(data3) > 4096) {
              const err5 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err6 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate1473.errors = vErrors;
  return errors === 0;
}
validate1473.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const getAdminUserOutput = validate1474;
const schema1620 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/UserDetail' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialUserDetail',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/getAdminUserOutput',
};
const schema1621 = {
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
    memberships: {
      type: 'array',
      items: { $ref: '#/components/schemas/MembershipSummary' },
    },
  },
};
const schema1622 = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    role: { type: 'string' },
    soleOwner: { type: 'boolean' },
  },
};
function validate1475(
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
  const evaluated0 = validate1475.evaluated;
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
    if (data.memberships !== undefined) {
      let data8 = data.memberships;
      if (Array.isArray(data8)) {
        const len0 = data8.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data9 = data8[i0];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.type !== undefined) {
              if (typeof data9.type !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/type/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data9.id !== undefined) {
              let data11 = data9.id;
              if (typeof data11 === 'string') {
                if (!formats0.test(data11)) {
                  const err10 = {
                    instancePath: instancePath + '/memberships/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/MembershipSummary/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err10];
                  } else {
                    vErrors.push(err10);
                  }
                  errors++;
                }
              } else {
                const err11 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/id/type',
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
            if (data9.tenantId !== undefined) {
              let data12 = data9.tenantId;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err12 = {
                    instancePath:
                      instancePath + '/memberships/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/MembershipSummary/properties/tenantId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err12];
                  } else {
                    vErrors.push(err12);
                  }
                  errors++;
                }
              } else {
                const err13 = {
                  instancePath:
                    instancePath + '/memberships/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/tenantId/type',
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
            if (data9.name !== undefined) {
              if (typeof data9.name !== 'string') {
                const err14 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
            }
            if (data9.role !== undefined) {
              if (typeof data9.role !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/role',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/role/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
            }
            if (data9.soleOwner !== undefined) {
              if (typeof data9.soleOwner !== 'boolean') {
                const err16 = {
                  instancePath:
                    instancePath + '/memberships/' + i0 + '/soleOwner',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/soleOwner/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
            }
          } else {
            const err17 = {
              instancePath: instancePath + '/memberships/' + i0,
              schemaPath: '#/components/schemas/MembershipSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/memberships',
          schemaPath: '#/properties/memberships/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate1475.errors = vErrors;
  return errors === 0;
}
validate1475.evaluated = {
  props: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    locale: true,
    verified: true,
    status: true,
    platformOperator: true,
    memberships: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1623 = {
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
    memberships: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialMembershipSummary' },
    },
  },
};
const schema1624 = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    role: { type: 'string' },
    soleOwner: { type: 'boolean' },
  },
};
function validate1477(
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
  const evaluated0 = validate1477.evaluated;
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
    if (data.memberships !== undefined) {
      let data8 = data.memberships;
      if (Array.isArray(data8)) {
        const len0 = data8.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data9 = data8[i0];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.type !== undefined) {
              if (typeof data9.type !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/PartialMembershipSummary/properties/type/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data9.id !== undefined) {
              let data11 = data9.id;
              if (typeof data11 === 'string') {
                if (!formats0.test(data11)) {
                  const err10 = {
                    instancePath: instancePath + '/memberships/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialMembershipSummary/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err10];
                  } else {
                    vErrors.push(err10);
                  }
                  errors++;
                }
              } else {
                const err11 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialMembershipSummary/properties/id/type',
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
            if (data9.tenantId !== undefined) {
              let data12 = data9.tenantId;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err12 = {
                    instancePath:
                      instancePath + '/memberships/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/PartialMembershipSummary/properties/tenantId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err12];
                  } else {
                    vErrors.push(err12);
                  }
                  errors++;
                }
              } else {
                const err13 = {
                  instancePath:
                    instancePath + '/memberships/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/PartialMembershipSummary/properties/tenantId/type',
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
            if (data9.name !== undefined) {
              if (typeof data9.name !== 'string') {
                const err14 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialMembershipSummary/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
            }
            if (data9.role !== undefined) {
              if (typeof data9.role !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/role',
                  schemaPath:
                    '#/components/schemas/PartialMembershipSummary/properties/role/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
            }
            if (data9.soleOwner !== undefined) {
              if (typeof data9.soleOwner !== 'boolean') {
                const err16 = {
                  instancePath:
                    instancePath + '/memberships/' + i0 + '/soleOwner',
                  schemaPath:
                    '#/components/schemas/PartialMembershipSummary/properties/soleOwner/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
            }
          } else {
            const err17 = {
              instancePath: instancePath + '/memberships/' + i0,
              schemaPath: '#/components/schemas/PartialMembershipSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/memberships',
          schemaPath: '#/properties/memberships/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate1477.errors = vErrors;
  return errors === 0;
}
validate1477.evaluated = {
  props: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    locale: true,
    verified: true,
    status: true,
    platformOperator: true,
    memberships: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1474(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/getAdminUserOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1474.evaluated;
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
    !validate1475(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1475.errors
        : vErrors.concat(validate1475.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.id = true;
    props0.email = true;
    props0.name = true;
    props0.avatar = true;
    props0.locale = true;
    props0.verified = true;
    props0.status = true;
    props0.platformOperator = true;
    props0.memberships = true;
  }
  const _errs2 = errors;
  if (
    !validate1477(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1477.errors
        : vErrors.concat(validate1477.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.id = true;
      props0.email = true;
      props0.name = true;
      props0.avatar = true;
      props0.locale = true;
      props0.verified = true;
      props0.status = true;
      props0.platformOperator = true;
      props0.memberships = true;
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
  validate1474.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1474.evaluated = { dynamicProps: true, dynamicItems: false };
export const getAdminUserOutputFull = validate1479;
const schema1625 = {
  $ref: 'https://edition.invalid/control#/components/schemas/UserDetail',
  $id: 'https://edition.invalid/validators/getAdminUserOutputFull',
};
function validate1480(
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
  const evaluated0 = validate1480.evaluated;
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
    if (data.memberships !== undefined) {
      let data8 = data.memberships;
      if (Array.isArray(data8)) {
        const len0 = data8.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data9 = data8[i0];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.type !== undefined) {
              if (typeof data9.type !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/type/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data9.id !== undefined) {
              let data11 = data9.id;
              if (typeof data11 === 'string') {
                if (!formats0.test(data11)) {
                  const err10 = {
                    instancePath: instancePath + '/memberships/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/MembershipSummary/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err10];
                  } else {
                    vErrors.push(err10);
                  }
                  errors++;
                }
              } else {
                const err11 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/id/type',
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
            if (data9.tenantId !== undefined) {
              let data12 = data9.tenantId;
              if (typeof data12 === 'string') {
                if (!formats0.test(data12)) {
                  const err12 = {
                    instancePath:
                      instancePath + '/memberships/' + i0 + '/tenantId',
                    schemaPath:
                      '#/components/schemas/MembershipSummary/properties/tenantId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err12];
                  } else {
                    vErrors.push(err12);
                  }
                  errors++;
                }
              } else {
                const err13 = {
                  instancePath:
                    instancePath + '/memberships/' + i0 + '/tenantId',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/tenantId/type',
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
            if (data9.name !== undefined) {
              if (typeof data9.name !== 'string') {
                const err14 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
            }
            if (data9.role !== undefined) {
              if (typeof data9.role !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/memberships/' + i0 + '/role',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/role/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
            }
            if (data9.soleOwner !== undefined) {
              if (typeof data9.soleOwner !== 'boolean') {
                const err16 = {
                  instancePath:
                    instancePath + '/memberships/' + i0 + '/soleOwner',
                  schemaPath:
                    '#/components/schemas/MembershipSummary/properties/soleOwner/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
            }
          } else {
            const err17 = {
              instancePath: instancePath + '/memberships/' + i0,
              schemaPath: '#/components/schemas/MembershipSummary/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/memberships',
          schemaPath: '#/properties/memberships/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate1480.errors = vErrors;
  return errors === 0;
}
validate1480.evaluated = {
  props: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    locale: true,
    verified: true,
    status: true,
    platformOperator: true,
    memberships: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1479(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/getAdminUserOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1479.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1480(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1480.errors
        : vErrors.concat(validate1480.errors);
    errors = vErrors.length;
  }
  validate1479.errors = vErrors;
  return errors === 0;
}
validate1479.evaluated = {
  props: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    locale: true,
    verified: true,
    status: true,
    platformOperator: true,
    memberships: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
