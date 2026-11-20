import { Client } from 'pg';

/**
 * 验收用的运维直连。
 *
 * 平台运营员标记由运维手工置位（票 05 定稿），所以验收就照运维手册那条 SQL 做，
 * 不给测试开专用后门端点。走 TCP 而非 docker compose，本机与 CI（service 容器）通用。
 */
const connectionString =
	process.env.E2E_DATABASE_URL ?? 'postgresql://space:space@localhost:5432/space';

export async function markPlatformOperator(email: string): Promise<void> {
	const client = new Client({ connectionString });
	await client.connect();
	try {
		await client.query('update iam.users set platform_operator = true where email = $1', [email]);
	} finally {
		await client.end();
	}
}

/**
 * synced 空间的页面只能来自导入（票 20）。导入流水线落地前，验收按导入回写的落库形态直接铺一页，
 * 用来验证界面/接口对 synced 页面的只读边界。
 */
export async function seedSyncedPage(
	tenantId: string,
	spaceId: string,
	title: string,
	slug: string
): Promise<string> {
	const client = new Client({ connectionString });
	await client.connect();
	try {
		const inserted = await client.query(
			`insert into authoring.pages (tenant_id, title, format, created_by_type, updated_by_type)
			 values ($1, $2, 'markdown', 'system', 'system') returning id::text`,
			[tenantId, title]
		);
		const pageId = inserted.rows[0].id as string;
		await client.query(
			'insert into authoring.space_page_placements (space_id, page_id, slug) values ($1, $2, $3)',
			[spaceId, pageId, slug]
		);
		return pageId;
	} finally {
		await client.end();
	}
}

/** 票 20 场景 10：空间已有未终态导入作业时，再 POST 应 409 import_in_progress。 */
export async function insertRunningImportJob(
	tenantId: string,
	spaceId: string
): Promise<() => Promise<void>> {
	const client = new Client({ connectionString });
	await client.connect();
	try {
		await client.query("select pg_advisory_lock(hashtext('import:' || $1::text))", [spaceId]);
		const result = await client.query(
			"insert into shared.jobs(tenant_id,type,space_id,status,phase,attempt) values($1,'import',$2,'running','inspecting',0) returning id",
			[tenantId, spaceId]
		);
		const id = result.rows[0].id;
		return async () => {
			try {
				await client.query('delete from shared.jobs where id=$1', [id]);
			} finally {
				await client.end();
			}
		};
	} catch (error) {
		await client.end();
		throw error;
	}
}

/** 票 22：假 DNS 的 TXT 桩。E2E 以库 owner 写入，space_app 只读。 */
export async function seedDnsTxt(name: string, value: string): Promise<void> {
	const client = new Client({ connectionString });
	await client.connect();
	try {
		await client.query(
			'insert into shared.dns_txt_stubs (name, value) values ($1, $2) on conflict do nothing',
			[name, value]
		);
	} finally {
		await client.end();
	}
}

/** 该空间 import 作业总数（远程地址被拒时必须为 0）。 */
export async function countImportJobs(spaceId: string): Promise<number> {
	const client = new Client({ connectionString });
	await client.connect();
	try {
		const counted = await client.query(
			"select count(*)::int as n from shared.jobs where type = 'import' and space_id = $1",
			[spaceId]
		);
		return counted.rows[0].n as number;
	} finally {
		await client.end();
	}
}

/** Read the persisted import provenance; ZIP generator identifies the exporting tool. */
export async function releaseGenerator(spaceId: string, releaseId: string): Promise<string | null> {
	const client = new Client({ connectionString });
	await client.connect();
	try {
		const result = await client.query(
			'select generator from releases.releases where space_id=$1 and id=$2',
			[spaceId, releaseId]
		);
		if (result.rowCount !== 1) throw new Error('Expected one release for this space');
		return result.rows[0].generator as string | null;
	} finally {
		await client.end();
	}
}
