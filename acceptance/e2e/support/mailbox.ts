import { expect } from '@playwright/test';
import { mailpitOrigin } from './environment';

type MailpitAddress = { Address: string };
type MailpitSummary = {
	ID: string;
	To: MailpitAddress[];
	Subject: string;
	Created: string;
};
type MailpitSearch = { messages: MailpitSummary[] };
type MailpitMessage = {
	ID: string;
	Subject: string;
	Date: string;
	Text: string;
};

export type MailboxBaseline = ReadonlySet<string>;

const verificationSubject = 'Space · 验证邮箱';

async function summaries(recipient: string) {
	const query = new URLSearchParams({
		query: `to:"${recipient}"`,
		limit: '50'
	});
	const response = await fetch(`${mailpitOrigin}/api/v1/search?${query}`);
	if (!response.ok) throw new Error(`Mailpit search failed: ${response.status}`);
	const result = (await response.json()) as MailpitSearch;
	return result.messages
		.filter((message) =>
			message.To.some((address) => address.Address.toLowerCase() === recipient.toLowerCase())
		)
		.sort((left, right) => Date.parse(right.Created) - Date.parse(left.Created));
}

async function message(id: string) {
	const response = await fetch(`${mailpitOrigin}/api/v1/message/${encodeURIComponent(id)}`);
	if (!response.ok) throw new Error(`Mailpit message fetch failed: ${response.status}`);
	return (await response.json()) as MailpitMessage;
}

export async function mailboxBaseline(
	recipient: string,
	subject: string
): Promise<MailboxBaseline> {
	return new Set(
		(await summaries(recipient))
			.filter((candidate) => candidate.Subject === subject)
			.map((candidate) => candidate.ID)
	);
}

async function latestMatching<T>(
	recipient: string,
	subject: string,
	parse: (mail: MailpitMessage) => T | undefined,
	options: { after?: number; baseline?: MailboxBaseline } = {}
) {
	let found: T | undefined;
	await expect
		.poll(
			async () => {
				const candidates = (await summaries(recipient)).filter(
					(candidate) =>
						candidate.Subject === subject &&
						!options.baseline?.has(candidate.ID) &&
						(options.after === undefined || Date.parse(candidate.Created) >= options.after)
				);
				for (const candidate of candidates) {
					const parsed = parse(await message(candidate.ID));
					if (parsed !== undefined) {
						found = parsed;
						return true;
					}
				}
				return false;
			},
			{
				timeout: 10_000,
				intervals: [100, 200, 500],
				message: `${subject} mail for ${recipient}`
			}
		)
		.toBe(true);
	if (found === undefined) throw new Error(`Matching Mailpit message not found for ${recipient}`);
	return found;
}

function links(text: string) {
	return (text.match(/https?:\/\/[^\s<>"']+/g) ?? []).flatMap((value) => {
		try {
			return [new URL(value)];
		} catch {
			return [];
		}
	});
}

export function verificationFor(
	recipient: string,
	options: { after?: number; baseline?: MailboxBaseline } = {}
) {
	return latestMatching(
		recipient,
		verificationSubject,
		(mail) => {
			const user = /^user=([^\s]+)$/m.exec(mail.Text)?.[1];
            const token = /^token=([^\s]+)$/m.exec(mail.Text)?.[1];
            if (user && token) return { user, token };
            const link = links(mail.Text).find(
				(candidate) =>
					candidate.searchParams.has('user') &&
					candidate.searchParams.has('token')
			);
			return link
				? { user: link.searchParams.get('user')!, token: link.searchParams.get('token')! }
				: undefined;
		},
		options
	);
}
