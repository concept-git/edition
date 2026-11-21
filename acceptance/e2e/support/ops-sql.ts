import { Client } from 'pg';

/**
 * 验收用的运维直连。
 *
 * 平台运营员标记由运维手工置位（票 05 定稿），所以验收就照运维手册那条 SQL 做，
 * 不给测试开专用后门端点。走 TCP 而非 docker compose，本机与 CI（service 容器）通用。
 */
const connectionString =
	process.env.E2E_DATABASE_URL ?? 'postgresql://edition:edition@localhost:5432/edition';

export async function markPlatformOperator(email: string): Promise<void> {
	const client = new Client({ connectionString });
	await client.connect();
	try {
		await client.query('update iam.users set platform_operator = true where email = $1', [email]);
	} finally {
		await client.end();
	}
}

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
