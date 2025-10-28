export interface Env {
	// If you set another name in the Wrangler config file as the value for 'binding',
	// replace "AI" with the variable name you defined.
	AI: Ai;
	// If you set another name in the Wrangler config file for the value for 'binding',
	// replace "DB" with the variable name you defined.
	prod_d1_tutorial: D1Database;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Password hashing utilities using Web Crypto API
async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const passwordData = encoder.encode(password);

	const key = await crypto.subtle.importKey(
		'raw',
		passwordData,
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);

	const hash = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		key,
		256
	);

	const hashArray = Array.from(new Uint8Array(hash));
	const saltArray = Array.from(salt);

	// Store as salt:hash in base64
	const saltBase64 = btoa(String.fromCharCode(...saltArray));
	const hashBase64 = btoa(String.fromCharCode(...hashArray));

	return `${saltBase64}:${hashBase64}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const [saltBase64, hashBase64] = storedHash.split(':');

	if (!saltBase64 || !hashBase64) {
		return false;
	}

	// Decode salt and hash from base64
	const salt = new Uint8Array(
		atob(saltBase64).split('').map(char => char.charCodeAt(0))
	);
	const storedHashArray = new Uint8Array(
		atob(hashBase64).split('').map(char => char.charCodeAt(0))
	);

	const passwordData = encoder.encode(password);

	const key = await crypto.subtle.importKey(
		'raw',
		passwordData,
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);

	const hash = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		key,
		256
	);

	const hashArray = new Uint8Array(hash);

	// Constant-time comparison
	if (hashArray.length !== storedHashArray.length) {
		return false;
	}

	let diff = 0;
	for (let i = 0; i < hashArray.length; i++) {
		diff |= hashArray[i] ^ storedHashArray[i];
	}

	return diff === 0;
}

// JWT Token utilities using Web Crypto API
async function generateToken(userId: string, username: string): Promise<string> {
	const header = {
		alg: 'HS256',
		typ: 'JWT'
	};

	const now = Math.floor(Date.now() / 1000);
	const payload = {
		userId,
		username,
		iat: now,
		exp: now + 3600 // 1 hour from now
	};

	// Encode header and payload
	const encoder = new TextEncoder();
	const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
	const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

	// Create signature
	const data = `${headerBase64}.${payloadBase64}`;
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode('your-secret-key-change-in-production'),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);

	const signature = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(data)
	);

	const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');

	return `${data}.${signatureBase64}`;
}

async function verifyToken(token: string): Promise<{ userId: string; username: string } | null> {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return null;
		}

		const [headerBase64, payloadBase64, signatureBase64] = parts;

		// Verify signature
		const encoder = new TextEncoder();
		const data = `${headerBase64}.${payloadBase64}`;
		const key = await crypto.subtle.importKey(
			'raw',
			encoder.encode('your-secret-key-change-in-production'),
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['verify']
		);

		// Decode signature
		const signature = Uint8Array.from(
			atob(signatureBase64.replace(/-/g, '+').replace(/_/g, '/'))
				.split('')
				.map(c => c.charCodeAt(0))
		);

		const isValid = await crypto.subtle.verify(
			'HMAC',
			key,
			signature,
			encoder.encode(data)
		);

		if (!isValid) {
			return null;
		}

		// Decode payload
		const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
		const payload = JSON.parse(payloadJson);

		// Check expiration
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp && payload.exp < now) {
			return null;
		}

		return {
			userId: payload.userId,
			username: payload.username
		};
	} catch (error) {
		console.error('Token verification error:', error);
		return null;
	}
}

// Middleware to extract authenticated user from request
async function getAuthenticatedUser(request: Request): Promise<{ userId: string; username: string } | null> {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return null;
	}

	const token = authHeader.substring(7);
	return await verifyToken(token);
}

export default {
	async fetch(request, env): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders
			});
		}

		const { pathname, searchParams } = new URL(request.url);
		const chatId = searchParams.get("chatId")
		console.log("CHATID", chatId)
		const stmt = env.prod_d1_tutorial.prepare(`SELECT * FROM chat_messages WHERE chat_id = ?`);

		const { results } = await stmt.bind(chatId).run();
		console.log("results", results)

		if (pathname === "/" && request.method === "GET") {
			// Get authenticated user
			const user = await getAuthenticatedUser(request);

			if (!user) {
				return new Response(JSON.stringify({
					success: false,
					error: "Authentication required"
				}), {
					status: 401,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});
			}

			return Response.json(results, {
				headers: corsHeaders
			});
		}

		if (pathname === "/latest-messages" && request.method === "GET") {
			// Get authenticated user
			const user = await getAuthenticatedUser(request);

			if (!user) {
				return new Response(JSON.stringify({
					success: false,
					error: "Authentication required"
				}), {
					status: 401,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});
			}

			// Query to get the latest message from each chat for the authenticated user
			const latestMessagesStmt = env.prod_d1_tutorial.prepare(`
				SELECT cm1.chat_id, cm1.message_id, cm1.sender, cm1.message, cm1.timestamp, c.chat_title
				FROM chat_messages cm1
				INNER JOIN (
					SELECT chat_id, MAX(timestamp) as max_timestamp
					FROM chat_messages
					GROUP BY chat_id
				) cm2 ON cm1.chat_id = cm2.chat_id AND cm1.timestamp = cm2.max_timestamp
				LEFT JOIN chats c ON cm1.chat_id = c.chat_id
				WHERE c.user_id = ?
				ORDER BY cm1.timestamp DESC
			`);

			const { results: latestMessages } = await latestMessagesStmt.bind(user.userId).run();
			console.log("Latest messages from each chat for user", user.userId, latestMessages);

			return Response.json(latestMessages, {
				headers: corsHeaders
			});
		}

		if (pathname === "/" && request.method === "POST") {
			// Get authenticated user
			const user = await getAuthenticatedUser(request);

			if (!user) {
				return new Response(JSON.stringify({
					success: false,
					error: "Authentication required"
				}), {
					status: 401,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});
			}

			const { userResponse } = await request.json<{ userResponse: string }>()

			// Check if this is a new chat (no existing messages)
			if (results.length === 0) {
				// Create a new chat entry in the chats table
				// Use AI to generate a title based on the first message
				const titleGenerationResult = await env.AI.run(
					"@cf/meta/llama-3.1-8b-instruct-fp8",
					{
						messages: [
							{
								role: "system",
								content: "Generate a short, concise title (max 5 words) for a chat conversation based on the user's first message. Only respond with the title, nothing else."
							},
							{
								role: "user",
								content: userResponse
							}
						]
					}
				);

				const chatTitle = (titleGenerationResult?.response || "New Chat").trim();
				console.log("Generated chat title:", chatTitle);

				// Use authenticated user's ID
				const createChatStmt = env.prod_d1_tutorial.prepare(
					`INSERT INTO chats (chat_id, user_id, chat_title) VALUES (?, ?, ?)`
				);
				await createChatStmt.bind(chatId, user.userId, chatTitle).run();
				console.log("Created new chat:", chatId, "with title:", chatTitle, "for user:", user.userId);
			}

			// Generate unique message_id using timestamp and random UUID
			const userMessageId = `${chatId}_${Date.now()}_${crypto.randomUUID()}`;
			const stmt1 = env.prod_d1_tutorial.prepare(`INSERT INTO chat_messages (message_id, sender, message, timestamp, chat_id) VALUES (?,?,?,?,?)`);
			const result1 = await stmt1.bind(userMessageId, "user", userResponse, new Date().toISOString(), chatId).run()
			console.log("SAVE USER RESULT", result1)

			const aiResult = await env.AI.run(
				"@cf/meta/llama-3.1-8b-instruct-fp8",
				{
					messages: [
						...results.map(result => ({
							role: result["sender"] as string,
							content: result["message"] as string,
						})),
						{
							role: "user",
							content: userResponse
						}
					]
				}
			);

			const assistantText = aiResult?.response;
			console.log("assistantText", assistantText)
			// Generate unique message_id for assistant response
			const assistantMessageId = `${chatId}_${Date.now()}_${crypto.randomUUID()}`;
			const stmt = env.prod_d1_tutorial.prepare(`INSERT INTO chat_messages (message_id, sender, message, timestamp, chat_id) VALUES (?,?,?,?,?)`);
			const result = await stmt.bind(assistantMessageId, "assistant", assistantText, new Date().toISOString(), chatId).run()
			console.log("SAVE ASSISTANT RESULT", result)
			return new Response(JSON.stringify({ assistantResponse: assistantText }), {
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json'
				}
			});
		}

		if (pathname === "/signup" && request.method === "POST") {
			try {
				const { username, password } = await request.json<{ username: string; password: string }>();

				// Validate input
				if (!username || !password) {
					return new Response(JSON.stringify({
						success: false,
						error: "Username and password are required"
					}), {
						status: 400,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				// Validate username format (alphanumeric and underscore, 3-20 characters)
				const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
				if (!usernameRegex.test(username)) {
					return new Response(JSON.stringify({
						success: false,
						error: "Username must be 3-20 characters and contain only letters, numbers, and underscores"
					}), {
						status: 400,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				// Validate password length
				if (password.length < 6) {
					return new Response(JSON.stringify({
						success: false,
						error: "Password must be at least 6 characters long"
					}), {
						status: 400,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				// Check if username already exists
				const checkUserStmt = env.prod_d1_tutorial.prepare(
					`SELECT user_id FROM users WHERE username = ?`
				);
				const { results: existingUsers } = await checkUserStmt.bind(username).run();

				if (existingUsers && existingUsers.length > 0) {
					return new Response(JSON.stringify({
						success: false,
						error: "Username already exists"
					}), {
						status: 409,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				// Generate unique user_id
				const userId = `USER_${Date.now()}_${crypto.randomUUID()}`;

				// Hash password before storing
				const hashedPassword = await hashPassword(password);

				// Insert new user
				const createUserStmt = env.prod_d1_tutorial.prepare(
					`INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)`
				);
				await createUserStmt.bind(userId, username, hashedPassword).run();

				console.log("Created new user:", userId, "with username:", username);

				return new Response(JSON.stringify({
					success: true,
					user_id: userId,
					username: username
				}), {
					status: 201,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});

			} catch (error) {
				console.error("Signup error:", error);
				return new Response(JSON.stringify({
					success: false,
					error: "An error occurred during signup"
				}), {
					status: 500,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});
			}
		}

		if (pathname === "/login" && request.method === "POST") {
			try {
				const { username, password } = await request.json<{ username: string; password: string }>();

				// Validate input
				if (!username || !password) {
					return new Response(JSON.stringify({
						success: false,
						error: "Username and password are required"
					}), {
						status: 400,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				// Find user by username
				const findUserStmt = env.prod_d1_tutorial.prepare(
					`SELECT user_id, username, password FROM users WHERE username = ?`
				);
				const { results: users } = await findUserStmt.bind(username).run();

				if (!users || users.length === 0) {
					return new Response(JSON.stringify({
						success: false,
						error: "Invalid username or password"
					}), {
						status: 401,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				const user = users[0];
				const storedPassword = user.password as string;

				// Verify password
				const isPasswordValid = await verifyPassword(password, storedPassword);

				if (!isPasswordValid) {
					return new Response(JSON.stringify({
						success: false,
						error: "Invalid username or password"
					}), {
						status: 401,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				console.log("User logged in:", user.user_id, "username:", username);

				return new Response(JSON.stringify({
					success: true,
					user_id: user.user_id,
					username: user.username
				}), {
					status: 200,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});

			} catch (error) {
				console.error("Login error:", error);
				return new Response(JSON.stringify({
					success: false,
					error: "An error occurred during login"
				}), {
					status: 500,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});
			}
		}

		if (pathname === "/refresh-token" && request.method === "POST") {
			try {
				// Get authenticated user from token
				const user = await getAuthenticatedUser(request);

				if (!user) {
					return new Response(JSON.stringify({
						success: false,
						error: "Invalid or expired token"
					}), {
						status: 401,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				// Generate new access token
				const newAccessToken = await generateToken(user.userId, user.username);

				return new Response(JSON.stringify({
					success: true,
					access_token: newAccessToken
				}), {
					status: 200,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});

			} catch (error) {
				console.error("Token refresh error:", error);
				return new Response(JSON.stringify({
					success: false,
					error: "An error occurred during token refresh"
				}), {
					status: 500,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});
			}
		}

		if (pathname === "/auth" && request.method === "POST") {
			try {
				const { username, password } = await request.json<{ username: string; password: string }>();

				// Validate input
				if (!username || !password) {
					return new Response(JSON.stringify({
						success: false,
						error: "Username and password are required"
					}), {
						status: 400,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				// Validate username format (alphanumeric and underscore, 3-20 characters)
				const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
				if (!usernameRegex.test(username)) {
					return new Response(JSON.stringify({
						success: false,
						error: "Username must be 3-20 characters and contain only letters, numbers, and underscores"
					}), {
						status: 400,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				// Validate password length
				if (password.length < 6) {
					return new Response(JSON.stringify({
						success: false,
						error: "Password must be at least 6 characters long"
					}), {
						status: 400,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

				// Try to find existing user
				const findUserStmt = env.prod_d1_tutorial.prepare(
					`SELECT user_id, username, password FROM users WHERE username = ?`
				);
				const { results: users } = await findUserStmt.bind(username).run();

				if (users && users.length > 0) {
					// User exists - try to log in
					const user = users[0];
					const storedPassword = user.password as string;

					// Verify password
					const isPasswordValid = await verifyPassword(password, storedPassword);

					if (!isPasswordValid) {
						return new Response(JSON.stringify({
							success: false,
							error: "Incorrect password",
							userExists: true
						}), {
							status: 401,
							headers: {
								...corsHeaders,
								'Content-Type': 'application/json'
							}
						});
					}

					console.log("User logged in:", user.user_id, "username:", username);

					// Generate access token
					const accessToken = await generateToken(user.user_id as string, user.username as string);

					return new Response(JSON.stringify({
						success: true,
						user_id: user.user_id,
						username: user.username,
						access_token: accessToken,
						action: "login"
					}), {
						status: 200,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				} else {
					// User doesn't exist - create new account
					const userId = `USER_${Date.now()}_${crypto.randomUUID()}`;
					const hashedPassword = await hashPassword(password);

					const createUserStmt = env.prod_d1_tutorial.prepare(
						`INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)`
					);
					await createUserStmt.bind(userId, username, hashedPassword).run();

					console.log("Created new user:", userId, "with username:", username);

					// Generate access token
					const accessToken = await generateToken(userId, username);

					return new Response(JSON.stringify({
						success: true,
						user_id: userId,
						username: username,
						access_token: accessToken,
						action: "signup"
					}), {
						status: 201,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json'
						}
					});
				}

			} catch (error) {
				console.error("Auth error:", error);
				return new Response(JSON.stringify({
					success: false,
					error: "An error occurred during authentication"
				}), {
					status: 500,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					}
				});
			}
		}

		return new Response("EOL", {
			headers: corsHeaders
		});

	},
} satisfies ExportedHandler<Env>;