// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewSiteInput = validate881;
const schema1013 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        siteId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'siteId'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/viewSiteInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate881(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewSiteInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate881.evaluated;
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
        if (data0.tenantId === undefined) {
          const err1 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.siteId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err3 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.siteId !== undefined) {
          let data2 = data0.siteId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err5 = {
                instancePath: instancePath + '/path/siteId',
                schemaPath: '#/properties/path/properties/siteId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/siteId',
              schemaPath: '#/properties/path/properties/siteId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.fields !== undefined) {
          let data4 = data3.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err8 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err9 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err11 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate881.errors = vErrors;
  return errors === 0;
}
validate881.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewSiteOutput = validate882;
const schema1014 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/SiteDetail' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialSiteDetail',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewSiteOutput',
};
const schema136 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    rule: { type: 'string' },
    home: { type: ['string', 'null'], format: 'uuid' },
    robotsPolicy: { type: 'string', enum: ['index', 'noindex'] },
    titleTemplate: { type: ['string', 'null'] },
    branding: { $ref: '#/components/schemas/SiteBranding' },
    locale: { type: ['string', 'null'] },
    analyticsId: { type: ['string', 'null'] },
    mounts: {
      type: 'array',
      items: { $ref: '#/components/schemas/SiteMount' },
    },
    domains: {
      type: 'array',
      items: { $ref: '#/components/schemas/SiteDomain' },
    },
    createdAt: { type: 'string', format: 'date-time' },
    createdBy: { type: ['string', 'null'], format: 'uuid' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: ['string', 'null'], format: 'uuid' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'create',
          'read',
          'update',
          'mount',
          'unmount',
          'remount',
          'reorder',
          'delete',
          'manage_permissions',
        ],
      },
    },
  },
  required: [
    'allowedActions',
    'analyticsId',
    'branding',
    'createdAt',
    'createdBy',
    'domains',
    'home',
    'id',
    'locale',
    'mounts',
    'name',
    'robotsPolicy',
    'rule',
    'tenantId',
    'titleTemplate',
    'updatedAt',
    'updatedBy',
  ],
};
const schema137 = {
  type: 'object',
  properties: {
    logo: { type: ['string', 'null'] },
    favicon: { type: ['string', 'null'] },
    primaryColor: { type: ['string', 'null'] },
  },
  required: ['favicon', 'logo', 'primaryColor'],
};
const schema138 = {
  type: 'object',
  properties: {
    spaceId: { type: 'string', format: 'uuid' },
    slug: { type: 'string' },
  },
  required: ['slug', 'spaceId'],
};
const schema139 = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    verified: { type: 'boolean' },
    isPrimary: { type: 'boolean' },
  },
  required: ['host', 'isPrimary', 'verified'],
};
const formats10 = fullFormats['date-time'];
function validate883(
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
  const evaluated0 = validate883.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.allowedActions === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'allowedActions' },
        message: "must have required property '" + 'allowedActions' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.analyticsId === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'analyticsId' },
        message: "must have required property '" + 'analyticsId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.branding === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'branding' },
        message: "must have required property '" + 'branding' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.createdAt === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdAt' },
        message: "must have required property '" + 'createdAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.createdBy === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdBy' },
        message: "must have required property '" + 'createdBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.domains === undefined) {
      const err5 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'domains' },
        message: "must have required property '" + 'domains' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.home === undefined) {
      const err6 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'home' },
        message: "must have required property '" + 'home' + "'",
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err7 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
      }
      errors++;
    }
    if (data.locale === undefined) {
      const err8 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'locale' },
        message: "must have required property '" + 'locale' + "'",
      };
      if (vErrors === null) {
        vErrors = [err8];
      } else {
        vErrors.push(err8);
      }
      errors++;
    }
    if (data.mounts === undefined) {
      const err9 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'mounts' },
        message: "must have required property '" + 'mounts' + "'",
      };
      if (vErrors === null) {
        vErrors = [err9];
      } else {
        vErrors.push(err9);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err10 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property '" + 'name' + "'",
      };
      if (vErrors === null) {
        vErrors = [err10];
      } else {
        vErrors.push(err10);
      }
      errors++;
    }
    if (data.robotsPolicy === undefined) {
      const err11 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'robotsPolicy' },
        message: "must have required property '" + 'robotsPolicy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err11];
      } else {
        vErrors.push(err11);
      }
      errors++;
    }
    if (data.rule === undefined) {
      const err12 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'rule' },
        message: "must have required property '" + 'rule' + "'",
      };
      if (vErrors === null) {
        vErrors = [err12];
      } else {
        vErrors.push(err12);
      }
      errors++;
    }
    if (data.tenantId === undefined) {
      const err13 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'tenantId' },
        message: "must have required property '" + 'tenantId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err13];
      } else {
        vErrors.push(err13);
      }
      errors++;
    }
    if (data.titleTemplate === undefined) {
      const err14 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'titleTemplate' },
        message: "must have required property '" + 'titleTemplate' + "'",
      };
      if (vErrors === null) {
        vErrors = [err14];
      } else {
        vErrors.push(err14);
      }
      errors++;
    }
    if (data.updatedAt === undefined) {
      const err15 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedAt' },
        message: "must have required property '" + 'updatedAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err15];
      } else {
        vErrors.push(err15);
      }
      errors++;
    }
    if (data.updatedBy === undefined) {
      const err16 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedBy' },
        message: "must have required property '" + 'updatedBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err16];
      } else {
        vErrors.push(err16);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err17 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.tenantId !== undefined) {
      let data1 = data.tenantId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err19 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err21 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.rule !== undefined) {
      if (typeof data.rule !== 'string') {
        const err22 = {
          instancePath: instancePath + '/rule',
          schemaPath: '#/properties/rule/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.home !== undefined) {
      let data4 = data.home;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err23 = {
          instancePath: instancePath + '/home',
          schemaPath: '#/properties/home/type',
          keyword: 'type',
          params: { type: schema136.properties.home.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data4 === 'string') {
        if (!formats0.test(data4)) {
          const err24 = {
            instancePath: instancePath + '/home',
            schemaPath: '#/properties/home/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
      }
    }
    if (data.robotsPolicy !== undefined) {
      let data5 = data.robotsPolicy;
      if (typeof data5 !== 'string') {
        const err25 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
      if (!(data5 === 'index' || data5 === 'noindex')) {
        const err26 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/enum',
          keyword: 'enum',
          params: { allowedValues: schema136.properties.robotsPolicy.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.titleTemplate !== undefined) {
      let data6 = data.titleTemplate;
      if (typeof data6 !== 'string' && data6 !== null) {
        const err27 = {
          instancePath: instancePath + '/titleTemplate',
          schemaPath: '#/properties/titleTemplate/type',
          keyword: 'type',
          params: { type: schema136.properties.titleTemplate.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.branding !== undefined) {
      let data7 = data.branding;
      if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
        if (data7.favicon === undefined) {
          const err28 = {
            instancePath: instancePath + '/branding',
            schemaPath: '#/components/schemas/SiteBranding/required',
            keyword: 'required',
            params: { missingProperty: 'favicon' },
            message: "must have required property '" + 'favicon' + "'",
          };
          if (vErrors === null) {
            vErrors = [err28];
          } else {
            vErrors.push(err28);
          }
          errors++;
        }
        if (data7.logo === undefined) {
          const err29 = {
            instancePath: instancePath + '/branding',
            schemaPath: '#/components/schemas/SiteBranding/required',
            keyword: 'required',
            params: { missingProperty: 'logo' },
            message: "must have required property '" + 'logo' + "'",
          };
          if (vErrors === null) {
            vErrors = [err29];
          } else {
            vErrors.push(err29);
          }
          errors++;
        }
        if (data7.primaryColor === undefined) {
          const err30 = {
            instancePath: instancePath + '/branding',
            schemaPath: '#/components/schemas/SiteBranding/required',
            keyword: 'required',
            params: { missingProperty: 'primaryColor' },
            message: "must have required property '" + 'primaryColor' + "'",
          };
          if (vErrors === null) {
            vErrors = [err30];
          } else {
            vErrors.push(err30);
          }
          errors++;
        }
        if (data7.logo !== undefined) {
          let data8 = data7.logo;
          if (typeof data8 !== 'string' && data8 !== null) {
            const err31 = {
              instancePath: instancePath + '/branding/logo',
              schemaPath:
                '#/components/schemas/SiteBranding/properties/logo/type',
              keyword: 'type',
              params: { type: schema137.properties.logo.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err31];
            } else {
              vErrors.push(err31);
            }
            errors++;
          }
        }
        if (data7.favicon !== undefined) {
          let data9 = data7.favicon;
          if (typeof data9 !== 'string' && data9 !== null) {
            const err32 = {
              instancePath: instancePath + '/branding/favicon',
              schemaPath:
                '#/components/schemas/SiteBranding/properties/favicon/type',
              keyword: 'type',
              params: { type: schema137.properties.favicon.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err32];
            } else {
              vErrors.push(err32);
            }
            errors++;
          }
        }
        if (data7.primaryColor !== undefined) {
          let data10 = data7.primaryColor;
          if (typeof data10 !== 'string' && data10 !== null) {
            const err33 = {
              instancePath: instancePath + '/branding/primaryColor',
              schemaPath:
                '#/components/schemas/SiteBranding/properties/primaryColor/type',
              keyword: 'type',
              params: { type: schema137.properties.primaryColor.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err33];
            } else {
              vErrors.push(err33);
            }
            errors++;
          }
        }
      } else {
        const err34 = {
          instancePath: instancePath + '/branding',
          schemaPath: '#/components/schemas/SiteBranding/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
    }
    if (data.locale !== undefined) {
      let data11 = data.locale;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err35 = {
          instancePath: instancePath + '/locale',
          schemaPath: '#/properties/locale/type',
          keyword: 'type',
          params: { type: schema136.properties.locale.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err35];
        } else {
          vErrors.push(err35);
        }
        errors++;
      }
    }
    if (data.analyticsId !== undefined) {
      let data12 = data.analyticsId;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err36 = {
          instancePath: instancePath + '/analyticsId',
          schemaPath: '#/properties/analyticsId/type',
          keyword: 'type',
          params: { type: schema136.properties.analyticsId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err36];
        } else {
          vErrors.push(err36);
        }
        errors++;
      }
    }
    if (data.mounts !== undefined) {
      let data13 = data.mounts;
      if (Array.isArray(data13)) {
        const len0 = data13.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data14 = data13[i0];
          if (data14 && typeof data14 == 'object' && !Array.isArray(data14)) {
            if (data14.slug === undefined) {
              const err37 = {
                instancePath: instancePath + '/mounts/' + i0,
                schemaPath: '#/components/schemas/SiteMount/required',
                keyword: 'required',
                params: { missingProperty: 'slug' },
                message: "must have required property '" + 'slug' + "'",
              };
              if (vErrors === null) {
                vErrors = [err37];
              } else {
                vErrors.push(err37);
              }
              errors++;
            }
            if (data14.spaceId === undefined) {
              const err38 = {
                instancePath: instancePath + '/mounts/' + i0,
                schemaPath: '#/components/schemas/SiteMount/required',
                keyword: 'required',
                params: { missingProperty: 'spaceId' },
                message: "must have required property '" + 'spaceId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err38];
              } else {
                vErrors.push(err38);
              }
              errors++;
            }
            if (data14.spaceId !== undefined) {
              let data15 = data14.spaceId;
              if (typeof data15 === 'string') {
                if (!formats0.test(data15)) {
                  const err39 = {
                    instancePath: instancePath + '/mounts/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/SiteMount/properties/spaceId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err39];
                  } else {
                    vErrors.push(err39);
                  }
                  errors++;
                }
              } else {
                const err40 = {
                  instancePath: instancePath + '/mounts/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/SiteMount/properties/spaceId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err40];
                } else {
                  vErrors.push(err40);
                }
                errors++;
              }
            }
            if (data14.slug !== undefined) {
              if (typeof data14.slug !== 'string') {
                const err41 = {
                  instancePath: instancePath + '/mounts/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/SiteMount/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err41];
                } else {
                  vErrors.push(err41);
                }
                errors++;
              }
            }
          } else {
            const err42 = {
              instancePath: instancePath + '/mounts/' + i0,
              schemaPath: '#/components/schemas/SiteMount/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err42];
            } else {
              vErrors.push(err42);
            }
            errors++;
          }
        }
      } else {
        const err43 = {
          instancePath: instancePath + '/mounts',
          schemaPath: '#/properties/mounts/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err43];
        } else {
          vErrors.push(err43);
        }
        errors++;
      }
    }
    if (data.domains !== undefined) {
      let data17 = data.domains;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data18 = data17[i1];
          if (data18 && typeof data18 == 'object' && !Array.isArray(data18)) {
            if (data18.host === undefined) {
              const err44 = {
                instancePath: instancePath + '/domains/' + i1,
                schemaPath: '#/components/schemas/SiteDomain/required',
                keyword: 'required',
                params: { missingProperty: 'host' },
                message: "must have required property '" + 'host' + "'",
              };
              if (vErrors === null) {
                vErrors = [err44];
              } else {
                vErrors.push(err44);
              }
              errors++;
            }
            if (data18.isPrimary === undefined) {
              const err45 = {
                instancePath: instancePath + '/domains/' + i1,
                schemaPath: '#/components/schemas/SiteDomain/required',
                keyword: 'required',
                params: { missingProperty: 'isPrimary' },
                message: "must have required property '" + 'isPrimary' + "'",
              };
              if (vErrors === null) {
                vErrors = [err45];
              } else {
                vErrors.push(err45);
              }
              errors++;
            }
            if (data18.verified === undefined) {
              const err46 = {
                instancePath: instancePath + '/domains/' + i1,
                schemaPath: '#/components/schemas/SiteDomain/required',
                keyword: 'required',
                params: { missingProperty: 'verified' },
                message: "must have required property '" + 'verified' + "'",
              };
              if (vErrors === null) {
                vErrors = [err46];
              } else {
                vErrors.push(err46);
              }
              errors++;
            }
            if (data18.host !== undefined) {
              if (typeof data18.host !== 'string') {
                const err47 = {
                  instancePath: instancePath + '/domains/' + i1 + '/host',
                  schemaPath:
                    '#/components/schemas/SiteDomain/properties/host/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err47];
                } else {
                  vErrors.push(err47);
                }
                errors++;
              }
            }
            if (data18.verified !== undefined) {
              if (typeof data18.verified !== 'boolean') {
                const err48 = {
                  instancePath: instancePath + '/domains/' + i1 + '/verified',
                  schemaPath:
                    '#/components/schemas/SiteDomain/properties/verified/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err48];
                } else {
                  vErrors.push(err48);
                }
                errors++;
              }
            }
            if (data18.isPrimary !== undefined) {
              if (typeof data18.isPrimary !== 'boolean') {
                const err49 = {
                  instancePath: instancePath + '/domains/' + i1 + '/isPrimary',
                  schemaPath:
                    '#/components/schemas/SiteDomain/properties/isPrimary/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err49];
                } else {
                  vErrors.push(err49);
                }
                errors++;
              }
            }
          } else {
            const err50 = {
              instancePath: instancePath + '/domains/' + i1,
              schemaPath: '#/components/schemas/SiteDomain/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err50];
            } else {
              vErrors.push(err50);
            }
            errors++;
          }
        }
      } else {
        const err51 = {
          instancePath: instancePath + '/domains',
          schemaPath: '#/properties/domains/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err51];
        } else {
          vErrors.push(err51);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data22 = data.createdAt;
      if (typeof data22 === 'string') {
        if (!formats10.validate(data22)) {
          const err52 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err52];
          } else {
            vErrors.push(err52);
          }
          errors++;
        }
      } else {
        const err53 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err53];
        } else {
          vErrors.push(err53);
        }
        errors++;
      }
    }
    if (data.createdBy !== undefined) {
      let data23 = data.createdBy;
      if (typeof data23 !== 'string' && data23 !== null) {
        const err54 = {
          instancePath: instancePath + '/createdBy',
          schemaPath: '#/properties/createdBy/type',
          keyword: 'type',
          params: { type: schema136.properties.createdBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err54];
        } else {
          vErrors.push(err54);
        }
        errors++;
      }
      if (typeof data23 === 'string') {
        if (!formats0.test(data23)) {
          const err55 = {
            instancePath: instancePath + '/createdBy',
            schemaPath: '#/properties/createdBy/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err55];
          } else {
            vErrors.push(err55);
          }
          errors++;
        }
      }
    }
    if (data.updatedAt !== undefined) {
      let data24 = data.updatedAt;
      if (typeof data24 === 'string') {
        if (!formats10.validate(data24)) {
          const err56 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err56];
          } else {
            vErrors.push(err56);
          }
          errors++;
        }
      } else {
        const err57 = {
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err57];
        } else {
          vErrors.push(err57);
        }
        errors++;
      }
    }
    if (data.updatedBy !== undefined) {
      let data25 = data.updatedBy;
      if (typeof data25 !== 'string' && data25 !== null) {
        const err58 = {
          instancePath: instancePath + '/updatedBy',
          schemaPath: '#/properties/updatedBy/type',
          keyword: 'type',
          params: { type: schema136.properties.updatedBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err58];
        } else {
          vErrors.push(err58);
        }
        errors++;
      }
      if (typeof data25 === 'string') {
        if (!formats0.test(data25)) {
          const err59 = {
            instancePath: instancePath + '/updatedBy',
            schemaPath: '#/properties/updatedBy/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err59];
          } else {
            vErrors.push(err59);
          }
          errors++;
        }
      }
    }
    if (data.allowedActions !== undefined) {
      let data26 = data.allowedActions;
      if (Array.isArray(data26)) {
        const len2 = data26.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data27 = data26[i2];
          if (typeof data27 !== 'string') {
            const err60 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err60];
            } else {
              vErrors.push(err60);
            }
            errors++;
          }
          if (!(
            data27 === 'create' ||
            data27 === 'read' ||
            data27 === 'update' ||
            data27 === 'mount' ||
            data27 === 'unmount' ||
            data27 === 'remount' ||
            data27 === 'reorder' ||
            data27 === 'delete' ||
            data27 === 'manage_permissions'
          )) {
            const err61 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema136.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err61];
            } else {
              vErrors.push(err61);
            }
            errors++;
          }
        }
      } else {
        const err62 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err62];
        } else {
          vErrors.push(err62);
        }
        errors++;
      }
    }
  } else {
    const err63 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err63];
    } else {
      vErrors.push(err63);
    }
    errors++;
  }
  validate883.errors = vErrors;
  return errors === 0;
}
validate883.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    rule: true,
    home: true,
    robotsPolicy: true,
    titleTemplate: true,
    branding: true,
    locale: true,
    analyticsId: true,
    mounts: true,
    domains: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    allowedActions: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1019 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    rule: { type: 'string' },
    home: { type: ['string', 'null'], format: 'uuid' },
    robotsPolicy: { type: 'string', enum: ['index', 'noindex'] },
    titleTemplate: { type: ['string', 'null'] },
    branding: { $ref: '#/components/schemas/PartialSiteBranding' },
    locale: { type: ['string', 'null'] },
    analyticsId: { type: ['string', 'null'] },
    mounts: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialSiteMount' },
    },
    domains: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialSiteDomain' },
    },
    createdAt: { type: 'string', format: 'date-time' },
    createdBy: { type: ['string', 'null'], format: 'uuid' },
    updatedAt: { type: 'string', format: 'date-time' },
    updatedBy: { type: ['string', 'null'], format: 'uuid' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'create',
          'read',
          'update',
          'mount',
          'unmount',
          'remount',
          'reorder',
          'delete',
          'manage_permissions',
        ],
      },
    },
  },
};
const schema1020 = {
  type: 'object',
  properties: {
    logo: { type: ['string', 'null'] },
    favicon: { type: ['string', 'null'] },
    primaryColor: { type: ['string', 'null'] },
  },
};
const schema1021 = {
  type: 'object',
  properties: {
    spaceId: { type: 'string', format: 'uuid' },
    slug: { type: 'string' },
  },
};
const schema660 = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    verified: { type: 'boolean' },
    isPrimary: { type: 'boolean' },
  },
};
function validate885(
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
  const evaluated0 = validate885.evaluated;
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
    if (data.tenantId !== undefined) {
      let data1 = data.tenantId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
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
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err4 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.rule !== undefined) {
      if (typeof data.rule !== 'string') {
        const err5 = {
          instancePath: instancePath + '/rule',
          schemaPath: '#/properties/rule/type',
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
    if (data.home !== undefined) {
      let data4 = data.home;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err6 = {
          instancePath: instancePath + '/home',
          schemaPath: '#/properties/home/type',
          keyword: 'type',
          params: { type: schema1019.properties.home.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (typeof data4 === 'string') {
        if (!formats0.test(data4)) {
          const err7 = {
            instancePath: instancePath + '/home',
            schemaPath: '#/properties/home/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      }
    }
    if (data.robotsPolicy !== undefined) {
      let data5 = data.robotsPolicy;
      if (typeof data5 !== 'string') {
        const err8 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/type',
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
      if (!(data5 === 'index' || data5 === 'noindex')) {
        const err9 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/enum',
          keyword: 'enum',
          params: { allowedValues: schema1019.properties.robotsPolicy.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.titleTemplate !== undefined) {
      let data6 = data.titleTemplate;
      if (typeof data6 !== 'string' && data6 !== null) {
        const err10 = {
          instancePath: instancePath + '/titleTemplate',
          schemaPath: '#/properties/titleTemplate/type',
          keyword: 'type',
          params: { type: schema1019.properties.titleTemplate.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.branding !== undefined) {
      let data7 = data.branding;
      if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
        if (data7.logo !== undefined) {
          let data8 = data7.logo;
          if (typeof data8 !== 'string' && data8 !== null) {
            const err11 = {
              instancePath: instancePath + '/branding/logo',
              schemaPath:
                '#/components/schemas/PartialSiteBranding/properties/logo/type',
              keyword: 'type',
              params: { type: schema1020.properties.logo.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
        if (data7.favicon !== undefined) {
          let data9 = data7.favicon;
          if (typeof data9 !== 'string' && data9 !== null) {
            const err12 = {
              instancePath: instancePath + '/branding/favicon',
              schemaPath:
                '#/components/schemas/PartialSiteBranding/properties/favicon/type',
              keyword: 'type',
              params: { type: schema1020.properties.favicon.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (data7.primaryColor !== undefined) {
          let data10 = data7.primaryColor;
          if (typeof data10 !== 'string' && data10 !== null) {
            const err13 = {
              instancePath: instancePath + '/branding/primaryColor',
              schemaPath:
                '#/components/schemas/PartialSiteBranding/properties/primaryColor/type',
              keyword: 'type',
              params: { type: schema1020.properties.primaryColor.type },
              message: 'must be string,null',
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
          instancePath: instancePath + '/branding',
          schemaPath: '#/components/schemas/PartialSiteBranding/type',
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
    if (data.locale !== undefined) {
      let data11 = data.locale;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err15 = {
          instancePath: instancePath + '/locale',
          schemaPath: '#/properties/locale/type',
          keyword: 'type',
          params: { type: schema1019.properties.locale.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.analyticsId !== undefined) {
      let data12 = data.analyticsId;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err16 = {
          instancePath: instancePath + '/analyticsId',
          schemaPath: '#/properties/analyticsId/type',
          keyword: 'type',
          params: { type: schema1019.properties.analyticsId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.mounts !== undefined) {
      let data13 = data.mounts;
      if (Array.isArray(data13)) {
        const len0 = data13.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data14 = data13[i0];
          if (data14 && typeof data14 == 'object' && !Array.isArray(data14)) {
            if (data14.spaceId !== undefined) {
              let data15 = data14.spaceId;
              if (typeof data15 === 'string') {
                if (!formats0.test(data15)) {
                  const err17 = {
                    instancePath: instancePath + '/mounts/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/PartialSiteMount/properties/spaceId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err17];
                  } else {
                    vErrors.push(err17);
                  }
                  errors++;
                }
              } else {
                const err18 = {
                  instancePath: instancePath + '/mounts/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/PartialSiteMount/properties/spaceId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
            }
            if (data14.slug !== undefined) {
              if (typeof data14.slug !== 'string') {
                const err19 = {
                  instancePath: instancePath + '/mounts/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/PartialSiteMount/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
          } else {
            const err20 = {
              instancePath: instancePath + '/mounts/' + i0,
              schemaPath: '#/components/schemas/PartialSiteMount/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
        }
      } else {
        const err21 = {
          instancePath: instancePath + '/mounts',
          schemaPath: '#/properties/mounts/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.domains !== undefined) {
      let data17 = data.domains;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data18 = data17[i1];
          if (data18 && typeof data18 == 'object' && !Array.isArray(data18)) {
            if (data18.host !== undefined) {
              if (typeof data18.host !== 'string') {
                const err22 = {
                  instancePath: instancePath + '/domains/' + i1 + '/host',
                  schemaPath:
                    '#/components/schemas/PartialSiteDomain/properties/host/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err22];
                } else {
                  vErrors.push(err22);
                }
                errors++;
              }
            }
            if (data18.verified !== undefined) {
              if (typeof data18.verified !== 'boolean') {
                const err23 = {
                  instancePath: instancePath + '/domains/' + i1 + '/verified',
                  schemaPath:
                    '#/components/schemas/PartialSiteDomain/properties/verified/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
            }
            if (data18.isPrimary !== undefined) {
              if (typeof data18.isPrimary !== 'boolean') {
                const err24 = {
                  instancePath: instancePath + '/domains/' + i1 + '/isPrimary',
                  schemaPath:
                    '#/components/schemas/PartialSiteDomain/properties/isPrimary/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
              }
            }
          } else {
            const err25 = {
              instancePath: instancePath + '/domains/' + i1,
              schemaPath: '#/components/schemas/PartialSiteDomain/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
        }
      } else {
        const err26 = {
          instancePath: instancePath + '/domains',
          schemaPath: '#/properties/domains/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data22 = data.createdAt;
      if (typeof data22 === 'string') {
        if (!formats10.validate(data22)) {
          const err27 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err27];
          } else {
            vErrors.push(err27);
          }
          errors++;
        }
      } else {
        const err28 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
    }
    if (data.createdBy !== undefined) {
      let data23 = data.createdBy;
      if (typeof data23 !== 'string' && data23 !== null) {
        const err29 = {
          instancePath: instancePath + '/createdBy',
          schemaPath: '#/properties/createdBy/type',
          keyword: 'type',
          params: { type: schema1019.properties.createdBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
      if (typeof data23 === 'string') {
        if (!formats0.test(data23)) {
          const err30 = {
            instancePath: instancePath + '/createdBy',
            schemaPath: '#/properties/createdBy/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err30];
          } else {
            vErrors.push(err30);
          }
          errors++;
        }
      }
    }
    if (data.updatedAt !== undefined) {
      let data24 = data.updatedAt;
      if (typeof data24 === 'string') {
        if (!formats10.validate(data24)) {
          const err31 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
    if (data.updatedBy !== undefined) {
      let data25 = data.updatedBy;
      if (typeof data25 !== 'string' && data25 !== null) {
        const err33 = {
          instancePath: instancePath + '/updatedBy',
          schemaPath: '#/properties/updatedBy/type',
          keyword: 'type',
          params: { type: schema1019.properties.updatedBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err33];
        } else {
          vErrors.push(err33);
        }
        errors++;
      }
      if (typeof data25 === 'string') {
        if (!formats0.test(data25)) {
          const err34 = {
            instancePath: instancePath + '/updatedBy',
            schemaPath: '#/properties/updatedBy/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err34];
          } else {
            vErrors.push(err34);
          }
          errors++;
        }
      }
    }
    if (data.allowedActions !== undefined) {
      let data26 = data.allowedActions;
      if (Array.isArray(data26)) {
        const len2 = data26.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data27 = data26[i2];
          if (typeof data27 !== 'string') {
            const err35 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err35];
            } else {
              vErrors.push(err35);
            }
            errors++;
          }
          if (!(
            data27 === 'create' ||
            data27 === 'read' ||
            data27 === 'update' ||
            data27 === 'mount' ||
            data27 === 'unmount' ||
            data27 === 'remount' ||
            data27 === 'reorder' ||
            data27 === 'delete' ||
            data27 === 'manage_permissions'
          )) {
            const err36 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema1019.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err36];
            } else {
              vErrors.push(err36);
            }
            errors++;
          }
        }
      } else {
        const err37 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err37];
        } else {
          vErrors.push(err37);
        }
        errors++;
      }
    }
  } else {
    const err38 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err38];
    } else {
      vErrors.push(err38);
    }
    errors++;
  }
  validate885.errors = vErrors;
  return errors === 0;
}
validate885.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    rule: true,
    home: true,
    robotsPolicy: true,
    titleTemplate: true,
    branding: true,
    locale: true,
    analyticsId: true,
    mounts: true,
    domains: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    allowedActions: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate882(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewSiteOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate882.evaluated;
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
    !validate883(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate883.errors
        : vErrors.concat(validate883.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.id = true;
    props0.tenantId = true;
    props0.name = true;
    props0.rule = true;
    props0.home = true;
    props0.robotsPolicy = true;
    props0.titleTemplate = true;
    props0.branding = true;
    props0.locale = true;
    props0.analyticsId = true;
    props0.mounts = true;
    props0.domains = true;
    props0.createdAt = true;
    props0.createdBy = true;
    props0.updatedAt = true;
    props0.updatedBy = true;
    props0.allowedActions = true;
  }
  const _errs2 = errors;
  if (
    !validate885(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate885.errors
        : vErrors.concat(validate885.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.id = true;
      props0.tenantId = true;
      props0.name = true;
      props0.rule = true;
      props0.home = true;
      props0.robotsPolicy = true;
      props0.titleTemplate = true;
      props0.branding = true;
      props0.locale = true;
      props0.analyticsId = true;
      props0.mounts = true;
      props0.domains = true;
      props0.createdAt = true;
      props0.createdBy = true;
      props0.updatedAt = true;
      props0.updatedBy = true;
      props0.allowedActions = true;
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
  validate882.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate882.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewSiteOutputFull = validate887;
const schema1023 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SiteDetail',
  $id: 'https://edition.invalid/validators/viewSiteOutputFull',
};
function validate888(
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
  const evaluated0 = validate888.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.allowedActions === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'allowedActions' },
        message: "must have required property '" + 'allowedActions' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.analyticsId === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'analyticsId' },
        message: "must have required property '" + 'analyticsId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.branding === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'branding' },
        message: "must have required property '" + 'branding' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.createdAt === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdAt' },
        message: "must have required property '" + 'createdAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.createdBy === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'createdBy' },
        message: "must have required property '" + 'createdBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.domains === undefined) {
      const err5 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'domains' },
        message: "must have required property '" + 'domains' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.home === undefined) {
      const err6 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'home' },
        message: "must have required property '" + 'home' + "'",
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err7 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
      }
      errors++;
    }
    if (data.locale === undefined) {
      const err8 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'locale' },
        message: "must have required property '" + 'locale' + "'",
      };
      if (vErrors === null) {
        vErrors = [err8];
      } else {
        vErrors.push(err8);
      }
      errors++;
    }
    if (data.mounts === undefined) {
      const err9 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'mounts' },
        message: "must have required property '" + 'mounts' + "'",
      };
      if (vErrors === null) {
        vErrors = [err9];
      } else {
        vErrors.push(err9);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err10 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property '" + 'name' + "'",
      };
      if (vErrors === null) {
        vErrors = [err10];
      } else {
        vErrors.push(err10);
      }
      errors++;
    }
    if (data.robotsPolicy === undefined) {
      const err11 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'robotsPolicy' },
        message: "must have required property '" + 'robotsPolicy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err11];
      } else {
        vErrors.push(err11);
      }
      errors++;
    }
    if (data.rule === undefined) {
      const err12 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'rule' },
        message: "must have required property '" + 'rule' + "'",
      };
      if (vErrors === null) {
        vErrors = [err12];
      } else {
        vErrors.push(err12);
      }
      errors++;
    }
    if (data.tenantId === undefined) {
      const err13 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'tenantId' },
        message: "must have required property '" + 'tenantId' + "'",
      };
      if (vErrors === null) {
        vErrors = [err13];
      } else {
        vErrors.push(err13);
      }
      errors++;
    }
    if (data.titleTemplate === undefined) {
      const err14 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'titleTemplate' },
        message: "must have required property '" + 'titleTemplate' + "'",
      };
      if (vErrors === null) {
        vErrors = [err14];
      } else {
        vErrors.push(err14);
      }
      errors++;
    }
    if (data.updatedAt === undefined) {
      const err15 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedAt' },
        message: "must have required property '" + 'updatedAt' + "'",
      };
      if (vErrors === null) {
        vErrors = [err15];
      } else {
        vErrors.push(err15);
      }
      errors++;
    }
    if (data.updatedBy === undefined) {
      const err16 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'updatedBy' },
        message: "must have required property '" + 'updatedBy' + "'",
      };
      if (vErrors === null) {
        vErrors = [err16];
      } else {
        vErrors.push(err16);
      }
      errors++;
    }
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err17 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.tenantId !== undefined) {
      let data1 = data.tenantId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err19 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err21 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.rule !== undefined) {
      if (typeof data.rule !== 'string') {
        const err22 = {
          instancePath: instancePath + '/rule',
          schemaPath: '#/properties/rule/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.home !== undefined) {
      let data4 = data.home;
      if (typeof data4 !== 'string' && data4 !== null) {
        const err23 = {
          instancePath: instancePath + '/home',
          schemaPath: '#/properties/home/type',
          keyword: 'type',
          params: { type: schema136.properties.home.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data4 === 'string') {
        if (!formats0.test(data4)) {
          const err24 = {
            instancePath: instancePath + '/home',
            schemaPath: '#/properties/home/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
      }
    }
    if (data.robotsPolicy !== undefined) {
      let data5 = data.robotsPolicy;
      if (typeof data5 !== 'string') {
        const err25 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
      if (!(data5 === 'index' || data5 === 'noindex')) {
        const err26 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/enum',
          keyword: 'enum',
          params: { allowedValues: schema136.properties.robotsPolicy.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.titleTemplate !== undefined) {
      let data6 = data.titleTemplate;
      if (typeof data6 !== 'string' && data6 !== null) {
        const err27 = {
          instancePath: instancePath + '/titleTemplate',
          schemaPath: '#/properties/titleTemplate/type',
          keyword: 'type',
          params: { type: schema136.properties.titleTemplate.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.branding !== undefined) {
      let data7 = data.branding;
      if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
        if (data7.favicon === undefined) {
          const err28 = {
            instancePath: instancePath + '/branding',
            schemaPath: '#/components/schemas/SiteBranding/required',
            keyword: 'required',
            params: { missingProperty: 'favicon' },
            message: "must have required property '" + 'favicon' + "'",
          };
          if (vErrors === null) {
            vErrors = [err28];
          } else {
            vErrors.push(err28);
          }
          errors++;
        }
        if (data7.logo === undefined) {
          const err29 = {
            instancePath: instancePath + '/branding',
            schemaPath: '#/components/schemas/SiteBranding/required',
            keyword: 'required',
            params: { missingProperty: 'logo' },
            message: "must have required property '" + 'logo' + "'",
          };
          if (vErrors === null) {
            vErrors = [err29];
          } else {
            vErrors.push(err29);
          }
          errors++;
        }
        if (data7.primaryColor === undefined) {
          const err30 = {
            instancePath: instancePath + '/branding',
            schemaPath: '#/components/schemas/SiteBranding/required',
            keyword: 'required',
            params: { missingProperty: 'primaryColor' },
            message: "must have required property '" + 'primaryColor' + "'",
          };
          if (vErrors === null) {
            vErrors = [err30];
          } else {
            vErrors.push(err30);
          }
          errors++;
        }
        if (data7.logo !== undefined) {
          let data8 = data7.logo;
          if (typeof data8 !== 'string' && data8 !== null) {
            const err31 = {
              instancePath: instancePath + '/branding/logo',
              schemaPath:
                '#/components/schemas/SiteBranding/properties/logo/type',
              keyword: 'type',
              params: { type: schema137.properties.logo.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err31];
            } else {
              vErrors.push(err31);
            }
            errors++;
          }
        }
        if (data7.favicon !== undefined) {
          let data9 = data7.favicon;
          if (typeof data9 !== 'string' && data9 !== null) {
            const err32 = {
              instancePath: instancePath + '/branding/favicon',
              schemaPath:
                '#/components/schemas/SiteBranding/properties/favicon/type',
              keyword: 'type',
              params: { type: schema137.properties.favicon.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err32];
            } else {
              vErrors.push(err32);
            }
            errors++;
          }
        }
        if (data7.primaryColor !== undefined) {
          let data10 = data7.primaryColor;
          if (typeof data10 !== 'string' && data10 !== null) {
            const err33 = {
              instancePath: instancePath + '/branding/primaryColor',
              schemaPath:
                '#/components/schemas/SiteBranding/properties/primaryColor/type',
              keyword: 'type',
              params: { type: schema137.properties.primaryColor.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err33];
            } else {
              vErrors.push(err33);
            }
            errors++;
          }
        }
      } else {
        const err34 = {
          instancePath: instancePath + '/branding',
          schemaPath: '#/components/schemas/SiteBranding/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
    }
    if (data.locale !== undefined) {
      let data11 = data.locale;
      if (typeof data11 !== 'string' && data11 !== null) {
        const err35 = {
          instancePath: instancePath + '/locale',
          schemaPath: '#/properties/locale/type',
          keyword: 'type',
          params: { type: schema136.properties.locale.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err35];
        } else {
          vErrors.push(err35);
        }
        errors++;
      }
    }
    if (data.analyticsId !== undefined) {
      let data12 = data.analyticsId;
      if (typeof data12 !== 'string' && data12 !== null) {
        const err36 = {
          instancePath: instancePath + '/analyticsId',
          schemaPath: '#/properties/analyticsId/type',
          keyword: 'type',
          params: { type: schema136.properties.analyticsId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err36];
        } else {
          vErrors.push(err36);
        }
        errors++;
      }
    }
    if (data.mounts !== undefined) {
      let data13 = data.mounts;
      if (Array.isArray(data13)) {
        const len0 = data13.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data14 = data13[i0];
          if (data14 && typeof data14 == 'object' && !Array.isArray(data14)) {
            if (data14.slug === undefined) {
              const err37 = {
                instancePath: instancePath + '/mounts/' + i0,
                schemaPath: '#/components/schemas/SiteMount/required',
                keyword: 'required',
                params: { missingProperty: 'slug' },
                message: "must have required property '" + 'slug' + "'",
              };
              if (vErrors === null) {
                vErrors = [err37];
              } else {
                vErrors.push(err37);
              }
              errors++;
            }
            if (data14.spaceId === undefined) {
              const err38 = {
                instancePath: instancePath + '/mounts/' + i0,
                schemaPath: '#/components/schemas/SiteMount/required',
                keyword: 'required',
                params: { missingProperty: 'spaceId' },
                message: "must have required property '" + 'spaceId' + "'",
              };
              if (vErrors === null) {
                vErrors = [err38];
              } else {
                vErrors.push(err38);
              }
              errors++;
            }
            if (data14.spaceId !== undefined) {
              let data15 = data14.spaceId;
              if (typeof data15 === 'string') {
                if (!formats0.test(data15)) {
                  const err39 = {
                    instancePath: instancePath + '/mounts/' + i0 + '/spaceId',
                    schemaPath:
                      '#/components/schemas/SiteMount/properties/spaceId/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err39];
                  } else {
                    vErrors.push(err39);
                  }
                  errors++;
                }
              } else {
                const err40 = {
                  instancePath: instancePath + '/mounts/' + i0 + '/spaceId',
                  schemaPath:
                    '#/components/schemas/SiteMount/properties/spaceId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err40];
                } else {
                  vErrors.push(err40);
                }
                errors++;
              }
            }
            if (data14.slug !== undefined) {
              if (typeof data14.slug !== 'string') {
                const err41 = {
                  instancePath: instancePath + '/mounts/' + i0 + '/slug',
                  schemaPath:
                    '#/components/schemas/SiteMount/properties/slug/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err41];
                } else {
                  vErrors.push(err41);
                }
                errors++;
              }
            }
          } else {
            const err42 = {
              instancePath: instancePath + '/mounts/' + i0,
              schemaPath: '#/components/schemas/SiteMount/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err42];
            } else {
              vErrors.push(err42);
            }
            errors++;
          }
        }
      } else {
        const err43 = {
          instancePath: instancePath + '/mounts',
          schemaPath: '#/properties/mounts/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err43];
        } else {
          vErrors.push(err43);
        }
        errors++;
      }
    }
    if (data.domains !== undefined) {
      let data17 = data.domains;
      if (Array.isArray(data17)) {
        const len1 = data17.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data18 = data17[i1];
          if (data18 && typeof data18 == 'object' && !Array.isArray(data18)) {
            if (data18.host === undefined) {
              const err44 = {
                instancePath: instancePath + '/domains/' + i1,
                schemaPath: '#/components/schemas/SiteDomain/required',
                keyword: 'required',
                params: { missingProperty: 'host' },
                message: "must have required property '" + 'host' + "'",
              };
              if (vErrors === null) {
                vErrors = [err44];
              } else {
                vErrors.push(err44);
              }
              errors++;
            }
            if (data18.isPrimary === undefined) {
              const err45 = {
                instancePath: instancePath + '/domains/' + i1,
                schemaPath: '#/components/schemas/SiteDomain/required',
                keyword: 'required',
                params: { missingProperty: 'isPrimary' },
                message: "must have required property '" + 'isPrimary' + "'",
              };
              if (vErrors === null) {
                vErrors = [err45];
              } else {
                vErrors.push(err45);
              }
              errors++;
            }
            if (data18.verified === undefined) {
              const err46 = {
                instancePath: instancePath + '/domains/' + i1,
                schemaPath: '#/components/schemas/SiteDomain/required',
                keyword: 'required',
                params: { missingProperty: 'verified' },
                message: "must have required property '" + 'verified' + "'",
              };
              if (vErrors === null) {
                vErrors = [err46];
              } else {
                vErrors.push(err46);
              }
              errors++;
            }
            if (data18.host !== undefined) {
              if (typeof data18.host !== 'string') {
                const err47 = {
                  instancePath: instancePath + '/domains/' + i1 + '/host',
                  schemaPath:
                    '#/components/schemas/SiteDomain/properties/host/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err47];
                } else {
                  vErrors.push(err47);
                }
                errors++;
              }
            }
            if (data18.verified !== undefined) {
              if (typeof data18.verified !== 'boolean') {
                const err48 = {
                  instancePath: instancePath + '/domains/' + i1 + '/verified',
                  schemaPath:
                    '#/components/schemas/SiteDomain/properties/verified/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err48];
                } else {
                  vErrors.push(err48);
                }
                errors++;
              }
            }
            if (data18.isPrimary !== undefined) {
              if (typeof data18.isPrimary !== 'boolean') {
                const err49 = {
                  instancePath: instancePath + '/domains/' + i1 + '/isPrimary',
                  schemaPath:
                    '#/components/schemas/SiteDomain/properties/isPrimary/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err49];
                } else {
                  vErrors.push(err49);
                }
                errors++;
              }
            }
          } else {
            const err50 = {
              instancePath: instancePath + '/domains/' + i1,
              schemaPath: '#/components/schemas/SiteDomain/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err50];
            } else {
              vErrors.push(err50);
            }
            errors++;
          }
        }
      } else {
        const err51 = {
          instancePath: instancePath + '/domains',
          schemaPath: '#/properties/domains/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err51];
        } else {
          vErrors.push(err51);
        }
        errors++;
      }
    }
    if (data.createdAt !== undefined) {
      let data22 = data.createdAt;
      if (typeof data22 === 'string') {
        if (!formats10.validate(data22)) {
          const err52 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err52];
          } else {
            vErrors.push(err52);
          }
          errors++;
        }
      } else {
        const err53 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err53];
        } else {
          vErrors.push(err53);
        }
        errors++;
      }
    }
    if (data.createdBy !== undefined) {
      let data23 = data.createdBy;
      if (typeof data23 !== 'string' && data23 !== null) {
        const err54 = {
          instancePath: instancePath + '/createdBy',
          schemaPath: '#/properties/createdBy/type',
          keyword: 'type',
          params: { type: schema136.properties.createdBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err54];
        } else {
          vErrors.push(err54);
        }
        errors++;
      }
      if (typeof data23 === 'string') {
        if (!formats0.test(data23)) {
          const err55 = {
            instancePath: instancePath + '/createdBy',
            schemaPath: '#/properties/createdBy/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err55];
          } else {
            vErrors.push(err55);
          }
          errors++;
        }
      }
    }
    if (data.updatedAt !== undefined) {
      let data24 = data.updatedAt;
      if (typeof data24 === 'string') {
        if (!formats10.validate(data24)) {
          const err56 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err56];
          } else {
            vErrors.push(err56);
          }
          errors++;
        }
      } else {
        const err57 = {
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err57];
        } else {
          vErrors.push(err57);
        }
        errors++;
      }
    }
    if (data.updatedBy !== undefined) {
      let data25 = data.updatedBy;
      if (typeof data25 !== 'string' && data25 !== null) {
        const err58 = {
          instancePath: instancePath + '/updatedBy',
          schemaPath: '#/properties/updatedBy/type',
          keyword: 'type',
          params: { type: schema136.properties.updatedBy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err58];
        } else {
          vErrors.push(err58);
        }
        errors++;
      }
      if (typeof data25 === 'string') {
        if (!formats0.test(data25)) {
          const err59 = {
            instancePath: instancePath + '/updatedBy',
            schemaPath: '#/properties/updatedBy/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err59];
          } else {
            vErrors.push(err59);
          }
          errors++;
        }
      }
    }
    if (data.allowedActions !== undefined) {
      let data26 = data.allowedActions;
      if (Array.isArray(data26)) {
        const len2 = data26.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data27 = data26[i2];
          if (typeof data27 !== 'string') {
            const err60 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err60];
            } else {
              vErrors.push(err60);
            }
            errors++;
          }
          if (!(
            data27 === 'create' ||
            data27 === 'read' ||
            data27 === 'update' ||
            data27 === 'mount' ||
            data27 === 'unmount' ||
            data27 === 'remount' ||
            data27 === 'reorder' ||
            data27 === 'delete' ||
            data27 === 'manage_permissions'
          )) {
            const err61 = {
              instancePath: instancePath + '/allowedActions/' + i2,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema136.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
            };
            if (vErrors === null) {
              vErrors = [err61];
            } else {
              vErrors.push(err61);
            }
            errors++;
          }
        }
      } else {
        const err62 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err62];
        } else {
          vErrors.push(err62);
        }
        errors++;
      }
    }
  } else {
    const err63 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err63];
    } else {
      vErrors.push(err63);
    }
    errors++;
  }
  validate888.errors = vErrors;
  return errors === 0;
}
validate888.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    rule: true,
    home: true,
    robotsPolicy: true,
    titleTemplate: true,
    branding: true,
    locale: true,
    analyticsId: true,
    mounts: true,
    domains: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    allowedActions: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate887(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewSiteOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate887.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate888(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate888.errors
        : vErrors.concat(validate888.errors);
    errors = vErrors.length;
  }
  validate887.errors = vErrors;
  return errors === 0;
}
validate887.evaluated = {
  props: {
    id: true,
    tenantId: true,
    name: true,
    rule: true,
    home: true,
    robotsPolicy: true,
    titleTemplate: true,
    branding: true,
    locale: true,
    analyticsId: true,
    mounts: true,
    domains: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    allowedActions: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
