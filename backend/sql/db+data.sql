--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

-- Started on 2026-02-19 18:20:29

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 245 (class 1259 OID 41240)
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    admin_id integer NOT NULL,
    username character varying(50),
    password character varying(255),
    full_name text,
    role character varying(50) DEFAULT 'ADMIN'::character varying,
    email character varying(255),
    pickup_point_id integer
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 41239)
-- Name: admin_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.admin ALTER COLUMN admin_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.admin_admin_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 16429)
-- Name: author; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.author (
    author_id integer NOT NULL,
    full_name text,
    description text
);


ALTER TABLE public.author OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16428)
-- Name: author_author_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.author_author_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.author_author_id_seq OWNER TO postgres;

--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 221
-- Name: author_author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.author_author_id_seq OWNED BY public.author.author_id;


--
-- TOC entry 224 (class 1259 OID 16438)
-- Name: book; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book (
    book_id integer NOT NULL,
    title text NOT NULL,
    author_id integer,
    description text,
    publication_date timestamp(6) without time zone,
    purchase_price double precision,
    rental_price double precision,
    stock_quantity integer,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    created_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    discount_percent numeric(5,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.book OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16437)
-- Name: book_book_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.book_book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.book_book_id_seq OWNER TO postgres;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 223
-- Name: book_book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.book_book_id_seq OWNED BY public.book.book_id;


--
-- TOC entry 228 (class 1259 OID 16469)
-- Name: book_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book_category (
    book_category_id integer NOT NULL,
    book_id integer,
    category_id integer
);


ALTER TABLE public.book_category OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16468)
-- Name: book_category_book_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.book_category_book_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.book_category_book_category_id_seq OWNER TO postgres;

--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 227
-- Name: book_category_book_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.book_category_book_category_id_seq OWNED BY public.book_category.book_category_id;


--
-- TOC entry 226 (class 1259 OID 16452)
-- Name: book_genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book_genre (
    book_genre_id integer NOT NULL,
    book_id integer,
    genre_id integer
);


ALTER TABLE public.book_genre OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16451)
-- Name: book_genre_book_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.book_genre_book_genre_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.book_genre_book_genre_id_seq OWNER TO postgres;

--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 225
-- Name: book_genre_book_genre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.book_genre_book_genre_id_seq OWNED BY public.book_genre.book_genre_id;


--
-- TOC entry 232 (class 1259 OID 24826)
-- Name: book_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.book_image (
    image_id integer NOT NULL,
    book_id integer,
    image_url text
);


ALTER TABLE public.book_image OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24845)
-- Name: book_image_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.book_image ALTER COLUMN image_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.book_image_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 24854)
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    cart_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 24853)
-- Name: cart_cart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_cart_id_seq OWNER TO postgres;

--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 236
-- Name: cart_cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_cart_id_seq OWNED BY public.cart.cart_id;


--
-- TOC entry 239 (class 1259 OID 24865)
-- Name: cart_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_item (
    cart_item_id integer NOT NULL,
    cart_id integer NOT NULL,
    book_id integer NOT NULL,
    type character varying(10) NOT NULL,
    rental_days integer,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_item_type_check CHECK (((type)::text = ANY ((ARRAY['RENT'::character varying, 'BUY'::character varying])::text[])))
);


ALTER TABLE public.cart_item OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 24864)
-- Name: cart_item_cart_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_item_cart_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_item_cart_item_id_seq OWNER TO postgres;

--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 238
-- Name: cart_item_cart_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_item_cart_item_id_seq OWNED BY public.cart_item.cart_item_id;


--
-- TOC entry 220 (class 1259 OID 16422)
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    category_id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16421)
-- Name: category_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.category_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.category_category_id_seq OWNER TO postgres;

--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 219
-- Name: category_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;


--
-- TOC entry 235 (class 1259 OID 24848)
-- Name: category_genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_genre (
    category_genre_id integer NOT NULL,
    category_id integer,
    genre_id integer
);


ALTER TABLE public.category_genre OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 24847)
-- Name: category_genre_category_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.category_genre ALTER COLUMN category_genre_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.category_genre_category_genre_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 24816)
-- Name: client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client (
    client_id integer DEFAULT nextval('public.book_book_id_seq'::regclass) NOT NULL,
    email character varying(255),
    password character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    contact_phone character varying(255),
    created_at timestamp without time zone
);


ALTER TABLE public.client OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16415)
-- Name: genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genre (
    genre_id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.genre OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16414)
-- Name: genre_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.genre_genre_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genre_genre_id_seq OWNER TO postgres;

--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 217
-- Name: genre_genre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.genre_genre_id_seq OWNED BY public.genre.genre_id;


--
-- TOC entry 243 (class 1259 OID 24888)
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    order_item_id integer NOT NULL,
    order_id integer NOT NULL,
    book_id integer NOT NULL,
    type character varying(20) NOT NULL,
    rental_days integer,
    rental_start_at timestamp without time zone,
    rental_end_at timestamp without time zone,
    item_status character varying(20),
    CONSTRAINT order_item_type_check CHECK (((type)::text = ANY (ARRAY[('RENT'::character varying)::text, ('BUY'::character varying)::text])))
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 24887)
-- Name: order_item_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_item_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_item_order_item_id_seq OWNER TO postgres;

--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 242
-- Name: order_item_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_item_order_item_id_seq OWNED BY public.order_item.order_item_id;


--
-- TOC entry 241 (class 1259 OID 24874)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    status character varying(50) DEFAULT 'CREATED'::character varying NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    paid_at timestamp without time zone,
    delivered_at timestamp without time zone,
    pickup_point_id integer,
    refunded_at timestamp without time zone,
    CONSTRAINT order_status_check CHECK (((status)::text = ANY ((ARRAY['CREATED'::character varying, 'PAID'::character varying, 'READY_FOR_PICKUP'::character varying, 'READY_FOR_PICKUP_UNPAID'::character varying, 'DELIVERED_AND_PAID'::character varying, 'DELIVERED'::character varying, 'RETURNED'::character varying, 'CANCELLED'::character varying, 'CANCELLED_BY_USER_PAID'::character varying, 'CANCELLED_BY_USER_UNPAID'::character varying, 'CANCELLED_BY_DEADLINE_PAID'::character varying, 'CANCELLED_BY_DEADLINE_UNPAID'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 24873)
-- Name: order_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_order_id_seq OWNER TO postgres;

--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 240
-- Name: order_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_order_id_seq OWNED BY public.orders.order_id;


--
-- TOC entry 246 (class 1259 OID 49429)
-- Name: pickup_point; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pickup_point (
    pickup_point_id integer NOT NULL,
    name character varying(255),
    address text,
    contact_phone character varying(50),
    working_hours text,
    is_active boolean
);


ALTER TABLE public.pickup_point OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16562)
-- Name: review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review (
    review_id integer NOT NULL,
    user_id integer,
    book_id integer,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.review OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16561)
-- Name: review_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.review_review_id_seq OWNER TO postgres;

--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 229
-- Name: review_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_review_id_seq OWNED BY public.review.review_id;


--
-- TOC entry 4770 (class 2604 OID 16432)
-- Name: author author_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.author ALTER COLUMN author_id SET DEFAULT nextval('public.author_author_id_seq'::regclass);


--
-- TOC entry 4771 (class 2604 OID 16441)
-- Name: book book_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book ALTER COLUMN book_id SET DEFAULT nextval('public.book_book_id_seq'::regclass);


--
-- TOC entry 4775 (class 2604 OID 16472)
-- Name: book_category book_category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_category ALTER COLUMN book_category_id SET DEFAULT nextval('public.book_category_book_category_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 16455)
-- Name: book_genre book_genre_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_genre ALTER COLUMN book_genre_id SET DEFAULT nextval('public.book_genre_book_genre_id_seq'::regclass);


--
-- TOC entry 4779 (class 2604 OID 24857)
-- Name: cart cart_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart ALTER COLUMN cart_id SET DEFAULT nextval('public.cart_cart_id_seq'::regclass);


--
-- TOC entry 4782 (class 2604 OID 24868)
-- Name: cart_item cart_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_item ALTER COLUMN cart_item_id SET DEFAULT nextval('public.cart_item_cart_item_id_seq'::regclass);


--
-- TOC entry 4769 (class 2604 OID 16425)
-- Name: category category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 16418)
-- Name: genre genre_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre ALTER COLUMN genre_id SET DEFAULT nextval('public.genre_genre_id_seq'::regclass);


--
-- TOC entry 4787 (class 2604 OID 24891)
-- Name: order_item order_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item ALTER COLUMN order_item_id SET DEFAULT nextval('public.order_item_order_item_id_seq'::regclass);


--
-- TOC entry 4784 (class 2604 OID 24877)
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.order_order_id_seq'::regclass);


--
-- TOC entry 4776 (class 2604 OID 16565)
-- Name: review review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review ALTER COLUMN review_id SET DEFAULT nextval('public.review_review_id_seq'::regclass);


--
-- TOC entry 5023 (class 0 OID 41240)
-- Dependencies: 245
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (admin_id, username, password, full_name, role, email, pickup_point_id) FROM stdin;
1	yarkhypov	$2a$10$tphLHRgYch1.QiXX7jPrcOv8pGHFguDfbvJV9m4WoWbOEBBsIlsaa	Yaroslav Arkhypov	ADMIN	yaroslavarkhipov44@gmail.com	\N
2	yarkhypovw	$2a$10$msQenl9fUWXfhcAovBeKneetWCdMVnwvoquAnGylEyvnMJfLl6UI2	Yaroslav ArkhypovW Updated	WORKER	test1@mail.com	1
\.


--
-- TOC entry 5000 (class 0 OID 16429)
-- Dependencies: 222
-- Data for Name: author; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.author (author_id, full_name, description) FROM stdin;
2	Harper Lee	A Southern-born author who brought to life deeply rooted social issues through gentle yet piercing storytelling. Her rare literary voice captured the innocence of childhood against a backdrop of moral complexity.
3	F. Scott Fitzgerald	A chronicler of the Roaring Twenties, he fused poetic language with razor-sharp social critique. His works often explore illusions, desire, and the fragile nature of identity in a world chasing after dreams.
4	Jane Austen	A keen observer of manners and relationships, she used wit and subtle irony to explore the social dynamics of her time. Her novels reveal a deep understanding of character, class, and the delicate dance of love and obligation.
5	Aldous Huxley	A philosopher at heart, he wove speculative thought into his fiction with striking imagination. His writing often questions the cost of progress and the fragility of human freedom in a changing world.
6	Chuck Palahniuk	Chuck Palahniuk is an American novelist known for his provocative and often dark explorations of modern society. His writing focuses on themes of identity, alienation, consumer culture, and the search for meaning in a disconnected world. With a sharp, minimalist style and a taste for psychological intensity, Palahniuk challenges social norms and pushes readers to confront uncomfortable truths about themselves and the systems they live in.
1	George Orwell	George Orwell was an English novelist, essayist, journalist, and cultural critic whose work continues to shape how we think about politics, power, and society. Renowned for his clear, direct style and intellectual honesty, Orwell examined the mechanisms of totalitarianism, the manipulation of truth, and the tension between individual conscience and oppressive systems. \nDrawing heavily from his own experiences—ranging from poverty and colonial service to war and political disillusionment—he wrote with rare moral urgency and precision. His essays and fiction expose how language can be weaponized, how ideology distorts reality, and how ordinary people are affected by vast political forces. Orwell’s writing remains influential not only for its prophetic insight, but for its unwavering commitment to clarity, integrity, and human freedom.
7	Stephen King	One of the most widely read and influential contemporary authors, Stephen King is renowned for his mastery of horror, suspense, and psychological thriller. His stories often explore the darker sides of human nature, fear, trauma, and morality, placing ordinary people in extraordinary and terrifying circumstances. Blending vivid realism with the supernatural, King creates immersive worlds where evil feels both external and deeply human. Beyond horror, his work reflects a keen understanding of society, memory, and personal struggle, which has secured his lasting impact on modern literature and popular culture.
\.


--
-- TOC entry 5002 (class 0 OID 16438)
-- Dependencies: 224
-- Data for Name: book; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.book (book_id, title, author_id, description, publication_date, purchase_price, rental_price, stock_quantity, status, created_at, updated_at, discount_percent) FROM stdin;
19	Fight Club	6	A dark and incisive social novel that examines identity, consumer culture, and modern masculinity. Through sharp irony and psychological tension, the story explores alienation, conformity, and the desire for meaning in a world defined by comfort and control. Balancing satire with introspection, the narrative traces the fragile line between rebellion and self-destruction, revealing how the search for freedom can expose deeper vulnerabilities and unexpected consequences.	1996-08-17 00:00:00	49.99	0.15	8	AVAILABLE	2026-02-10 19:45:47.778954	2026-02-19 17:05:57.775864	0.00
12	To Kill a Mockingbird	2	Set in a sleepy Southern town, this story is a moving portrait of moral growth, childhood, and quiet courage in the face of injustice and prejudice.	1960-07-11 00:00:00	34.49	0.11	5	AVAILABLE	2025-04-21 20:31:24.27499	2026-02-14 00:12:30.420151	0.00
14	Pride and Prejudice	4	A sparkling social comedy that peels back the layers of courtship, class, and clever wit, exploring how pride, misunderstandings, and first impressions shape relationships. Set in a world of constrained choices and strict social norms, the story balances irony and romance, leading its characters toward growth, self-awareness, and heartfelt surprises.	1813-01-28 00:00:00	37	0.1	4	AVAILABLE	2025-04-21 20:31:24.27499	2026-02-19 17:05:57.775864	0.00
11	1984	1	A haunting vision of a tightly controlled society where truth is subjective and constantly manipulated. This novel explores a world of total surveillance, absolute power, and manufactured reality. Through the quiet rebellion of an ordinary man, it exposes how fear, propaganda, and control erase personal identity, free thought, and even the meaning of truth itself.	1949-06-08 00:00:00	36.99	0.13	4	AVAILABLE	2025-04-21 20:31:24.27499	2026-02-16 23:19:07.543867	10.00
15	Brave New World	5	A chilling exploration of a future society addicted to pleasure, order, and artificial happiness — questioning what humanity sacrifices for stability and control.	1932-08-18 00:00:00	41.59	0.14	4	AVAILABLE	2025-04-21 20:31:24.27499	2026-02-19 14:17:52.647962	0.00
13	The Great Gatsby	3	A dazzling tale of opulence, ambition, and the seductive pull of the American dream — told through the lens of a mysterious millionaire and a world that glitters on the surface but aches beneath.	1925-04-10 00:00:00	42.29	0.13	5	AVAILABLE	2025-04-21 20:31:24.27499	2026-02-19 17:04:54.377581	0.00
\.


--
-- TOC entry 5006 (class 0 OID 16469)
-- Dependencies: 228
-- Data for Name: book_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.book_category (book_category_id, book_id, category_id) FROM stdin;
1	11	5
2	12	4
3	13	4
4	14	4
5	15	5
6	11	3
7	13	3
26	19	4
\.


--
-- TOC entry 5004 (class 0 OID 16452)
-- Dependencies: 226
-- Data for Name: book_genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.book_genre (book_genre_id, book_id, genre_id) FROM stdin;
1	11	1
2	11	2
3	11	3
4	11	44
5	12	4
6	12	5
7	12	6
8	12	44
9	13	2
10	13	6
11	13	7
12	13	45
13	13	46
15	14	5
16	14	6
17	15	1
18	15	9
19	15	46
20	14	2
21	19	2
22	19	7
23	19	46
\.


--
-- TOC entry 5010 (class 0 OID 24826)
-- Dependencies: 232
-- Data for Name: book_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.book_image (image_id, book_id, image_url) FROM stdin;
11	11	https://res.cloudinary.com/dzr6dzjaq/image/upload/v1745262011/1984_cover.jpg
12	12	https://res.cloudinary.com/dzr6dzjaq/image/upload/v1745262484/to_kill_a_mockingbird_cover.jpg
22	14	https://res.cloudinary.com/dzr6dzjaq/image/upload/v1745262485/pride_and_prejudice_cover.jpg
24	15	https://res.cloudinary.com/dzr6dzjaq/image/upload/v1745262483/brave_new_world_cover.jpg
30	13	https://res.cloudinary.com/dzr6dzjaq/image/upload/v1745262483/the_great_gatsby_cover.jpg
31	19	https://res.cloudinary.com/dzr6dzjaq/image/upload/v1746311756/fight_club_cover.jpg
\.


--
-- TOC entry 5015 (class 0 OID 24854)
-- Dependencies: 237
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (cart_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5017 (class 0 OID 24865)
-- Dependencies: 239
-- Data for Name: cart_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_item (cart_item_id, cart_id, book_id, type, rental_days, added_at) FROM stdin;
\.


--
-- TOC entry 4998 (class 0 OID 16422)
-- Dependencies: 220
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (category_id, name) FROM stdin;
1	New Releases
2	Discounts
3	Bestsellers
4	Fiction
5	Sci-Fi & Fantasy
6	Non-Fiction
7	Adventure & Mystery
8	Poetry & Graphic Novels
9	Self-Help & Relationships
10	Crafts & Hobbies
11	Sports
\.


--
-- TOC entry 5013 (class 0 OID 24848)
-- Dependencies: 235
-- Data for Name: category_genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category_genre (category_genre_id, category_id, genre_id) FROM stdin;
133	4	44
134	4	45
135	4	46
89	4	1
90	4	2
91	4	3
92	4	4
93	4	5
94	4	6
95	4	7
96	4	8
97	5	9
98	5	10
99	5	11
100	5	12
101	5	13
102	5	14
103	5	15
104	6	16
105	6	17
106	6	18
107	6	19
108	6	20
109	6	21
110	6	22
111	7	23
112	7	24
113	7	25
114	7	26
115	8	27
116	8	28
117	8	29
118	8	43
119	9	17
120	9	34
121	9	35
122	9	36
123	9	37
124	10	38
125	10	39
126	10	40
127	10	41
128	10	42
129	11	30
130	11	31
131	11	32
132	11	33
\.


--
-- TOC entry 5009 (class 0 OID 24816)
-- Dependencies: 231
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client (client_id, email, password, first_name, last_name, contact_phone, created_at) FROM stdin;
5	sosok116120172@gmail.com	$2a$10$d1EcUREwc0XXu6UEGL8kUet3mQCBLUVfWfpSEt6pMtOsFopcElszq	Yaroslav	Arkhypov	+48576959941	2025-02-26 20:03:08.544293
16	test1@example.com	$2a$10$wMi9n.gaTa0pHgONvonDf.gbx9nvzL0Ob6tNOQLo06g9dsIj3O99a	Gary	Pace	+35455765321	2025-04-29 22:29:35.242172
17	emily.kowalski@example.com	$2a$10$cYWHzUMUq6iXz/HX/TvelOvP4Pw5rUTlhP1lphLNSrDcsFtBxLepW	Emily	Kowalski	+48512345676	2025-07-18 23:16:44.691494
18	gdominika248@gmail.com	$2a$10$cgxAgvRIykIG.jVDxExRiOGMMjmPdPVY9.MNF18.2.c5zmx5M2uRS	Dominika	Gajda	+48518902851	2025-07-27 17:08:22.44591
1	test@example.com	$2a$10$1e0.ymHJNKTW4vHZQ6bqs./REimtrUaz8pXeXwoK.WieVDGlEv/8.	John	Doe	+48500800128	2024-12-03 00:14:28.836706
20	madison_reilly@example.com	$2a$10$cA8ibAaz0mjWKLWxmkhDCex0yg77hyLprblc.kqBzmDivYybZrdYW	Madison	Reilly	+44588920555	2026-02-19 14:16:30.013135
21	magnuschess@example.com	$2a$10$9lgxbP/IzlamEtyH5e./m.TRzkvZFQyOv8MZZIwag4ig8jNVSZt.i	Magnus	Karlsen	+43666987565	2026-02-19 17:04:21.662552
\.


--
-- TOC entry 4996 (class 0 OID 16415)
-- Dependencies: 218
-- Data for Name: genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.genre (genre_id, name) FROM stdin;
1	Dystopian
2	Classic
3	Historical
4	Coming-of-Age
5	Romance
6	Drama
7	Literary Fiction
8	Gothic Fiction
9	Science Fiction
10	Fantasy
11	Urban Fantasy
12	Dark Fantasy
13	Epic Fantasy
14	Cyberpunk
15	Space Opera
16	Biography
17	Self-Help
18	True Crime
19	Philosophy
20	Science
21	Psychology
22	Spirituality
23	Adventure
24	Mystery
25	Thriller
26	Horror
27	Poetry
28	Comics
29	Graphic Novel
30	Sports Biographies
31	Sports Fiction
32	Coaching
33	Fitness & Training
34	Relationships
35	Parenting
36	Career
37	Dating
38	Crafts & Hobbies
39	DIY
40	Gardening
41	Home Improvement
42	Woodworking
43	Manga
44	Political Fiction
45	Tragedy
46	Modernism
\.


--
-- TOC entry 5021 (class 0 OID 24888)
-- Dependencies: 243
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item (order_item_id, order_id, book_id, type, rental_days, rental_start_at, rental_end_at, item_status) FROM stdin;
17	14	11	BUY	\N	\N	\N	DELIVERED
16	14	12	RENT	30	2026-02-13 22:37:35.455619	2026-02-14 00:11:44.050616	RETURNED
15	13	12	BUY	\N	\N	\N	PENDING
18	15	19	BUY	\N	\N	\N	CANCELLED
20	17	19	BUY	\N	\N	\N	CANCELLED
21	17	11	BUY	\N	\N	\N	CANCELLED
19	16	15	BUY	\N	\N	\N	DELIVERED
22	18	15	RENT	90	2026-02-19 17:01:36.344627	2026-05-21 17:01:36.344627	RENTED
23	18	13	RENT	30	2026-02-19 17:01:36.344627	2026-03-22 17:01:36.344627	RENTED
24	19	19	BUY	\N	\N	\N	DELIVERED
25	20	19	BUY	\N	\N	\N	DELIVERED
26	20	14	BUY	\N	\N	\N	DELIVERED
\.


--
-- TOC entry 5019 (class 0 OID 24874)
-- Dependencies: 241
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (order_id, user_id, status, total_price, created_at, paid_at, delivered_at, pickup_point_id, refunded_at) FROM stdin;
14	1	DELIVERED	39.29	2025-09-02 18:11:38.501308	2025-09-02 18:11:46.046092	2026-02-13 22:37:35.454619	1	\N
15	1	CANCELLED_BY_USER_PAID	47.49	2026-02-15 19:08:55.564922	2026-02-15 19:08:58.414475	\N	1	2026-02-15 19:40:51.924028
13	1	CANCELLED	34.49	2025-09-01 23:18:33.195102	2025-09-01 23:18:36.513763	\N	1	2026-02-15 20:10:45.232837
17	1	CANCELLED_BY_USER_PAID	80.78	2026-02-16 23:09:13.273716	2026-02-16 23:09:19.408897	\N	1	2026-02-16 23:19:29.793698
16	1	DELIVERED_AND_PAID	41.59	2026-02-15 20:12:06.284411	2026-02-16 23:21:32.888438	2026-02-16 23:21:32.888438	1	\N
18	20	DELIVERED	16.50	2026-02-19 14:17:52.625983	2026-02-19 14:17:54.74084	2026-02-19 17:01:36.331029	1	\N
19	20	DELIVERED_AND_PAID	47.49	2026-02-19 17:02:27.772132	2026-02-19 17:03:09.001257	2026-02-19 17:03:09.001257	1	\N
20	21	DELIVERED	86.99	2026-02-19 17:05:57.7679	2026-02-19 17:06:00.679112	2026-02-19 17:07:01.984736	3	\N
\.


--
-- TOC entry 5024 (class 0 OID 49429)
-- Dependencies: 246
-- Data for Name: pickup_point; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pickup_point (pickup_point_id, name, address, contact_phone, working_hours, is_active) FROM stdin;
1	Biblioteka Centralna	ul. Słoneczna 12, 90-123 Łódź	+48147063287	Mon-Fri: 09:00-18:00, Sat: 10:00-16:00, Sun: Closed	t
2	Punkt odbioru Kwiatowy	al. Kwiatowa 7/9, 91-456 Łódź	+48186951893	Mon-Fri: 08:30-17:30, Sat: 09:00-14:00, Sun: Closed	t
3	Galeria Express	ul. Brzozowa 45, 92-789 Łódź	+48557380464	Mon-Fri: 09:00-19:00, Sat: 10:00-15:00, Sun: Closed	t
4	Róg Wolności (punkt przy wejściu do Muzeum Sztuki Współczesnej)	pl. Wolności 3, 90-987 Łódź	+48831223917	Mon-Fri: 08:00-16:00, Sat: 09:00-13:00, Sun: Closed	t
5	Punkt odbioru Zielona Polana	ul. Zielona Polana 28, 91-234 Łódź	+48790233342	Mon-Fri: 09:30-18:30, Sat: 10:00-14:00, Sun: Closed	t
\.


--
-- TOC entry 5008 (class 0 OID 16562)
-- Dependencies: 230
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review (review_id, user_id, book_id, rating, comment, created_at) FROM stdin;
2	1	11	5	A chilling and powerful depiction of a totalitarian world that feels disturbingly relevant even today. Orwell’s writing is sharp and thought-provoking, making you question freedom, truth, and the power of language. A must-read classic that leaves you unsettled but enlightened.	2025-08-15 22:33:00.164338
4	1	12	5	Amazing!	2025-09-02 18:12:36.177215
\.


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 244
-- Name: admin_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_admin_id_seq', 3, true);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 221
-- Name: author_author_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.author_author_id_seq', 7, true);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 223
-- Name: book_book_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.book_book_id_seq', 21, true);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 227
-- Name: book_category_book_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.book_category_book_category_id_seq', 27, true);


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 225
-- Name: book_genre_book_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.book_genre_book_genre_id_seq', 23, true);


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 233
-- Name: book_image_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.book_image_image_id_seq', 31, true);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 236
-- Name: cart_cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_cart_id_seq', 33, true);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 238
-- Name: cart_item_cart_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_item_cart_item_id_seq', 58, true);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 219
-- Name: category_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_category_id_seq', 1, false);


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 234
-- Name: category_genre_category_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_genre_category_genre_id_seq', 132, true);


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 217
-- Name: genre_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.genre_genre_id_seq', 1, true);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 242
-- Name: order_item_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_item_order_item_id_seq', 26, true);


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 240
-- Name: order_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_order_id_seq', 20, true);


--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 229
-- Name: review_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_review_id_seq', 4, true);


--
-- TOC entry 4830 (class 2606 OID 41244)
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 4797 (class 2606 OID 16436)
-- Name: author author_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.author
    ADD CONSTRAINT author_pkey PRIMARY KEY (author_id);


--
-- TOC entry 4805 (class 2606 OID 16474)
-- Name: book_category book_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_category
    ADD CONSTRAINT book_category_pkey PRIMARY KEY (book_category_id);


--
-- TOC entry 4801 (class 2606 OID 16457)
-- Name: book_genre book_genre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_genre
    ADD CONSTRAINT book_genre_pkey PRIMARY KEY (book_genre_id);


--
-- TOC entry 4815 (class 2606 OID 24832)
-- Name: book_image book_image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_image
    ADD CONSTRAINT book_image_pkey PRIMARY KEY (image_id);


--
-- TOC entry 4799 (class 2606 OID 16445)
-- Name: book book_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (book_id);


--
-- TOC entry 4824 (class 2606 OID 24872)
-- Name: cart_item cart_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_pkey PRIMARY KEY (cart_item_id);


--
-- TOC entry 4820 (class 2606 OID 24861)
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (cart_id);


--
-- TOC entry 4822 (class 2606 OID 24931)
-- Name: cart cart_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_key UNIQUE (user_id);


--
-- TOC entry 4818 (class 2606 OID 24852)
-- Name: category_genre category_genre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_genre
    ADD CONSTRAINT category_genre_pkey PRIMARY KEY (category_genre_id);


--
-- TOC entry 4795 (class 2606 OID 16427)
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4813 (class 2606 OID 24822)
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (client_id);


--
-- TOC entry 4793 (class 2606 OID 16420)
-- Name: genre genre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT genre_pkey PRIMARY KEY (genre_id);


--
-- TOC entry 4828 (class 2606 OID 24894)
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (order_item_id);


--
-- TOC entry 4826 (class 2606 OID 24882)
-- Name: orders order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT order_pkey PRIMARY KEY (order_id);


--
-- TOC entry 4834 (class 2606 OID 49435)
-- Name: pickup_point pickup_point_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickup_point
    ADD CONSTRAINT pickup_point_pkey PRIMARY KEY (pickup_point_id);


--
-- TOC entry 4809 (class 2606 OID 16570)
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (review_id);


--
-- TOC entry 4807 (class 2606 OID 57624)
-- Name: book_category uk_book_id_category_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_category
    ADD CONSTRAINT uk_book_id_category_id UNIQUE (book_id, category_id);


--
-- TOC entry 4803 (class 2606 OID 57622)
-- Name: book_genre uk_book_id_genre_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_genre
    ADD CONSTRAINT uk_book_id_genre_id UNIQUE (book_id, genre_id);


--
-- TOC entry 4811 (class 2606 OID 41238)
-- Name: review unique_user_book_review; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT unique_user_book_review UNIQUE (user_id, book_id);


--
-- TOC entry 4832 (class 2606 OID 41249)
-- Name: admin unique_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- TOC entry 4816 (class 1259 OID 24839)
-- Name: fki_book_image_book_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_book_image_book_id_fkey ON public.book_image USING btree (book_id);


--
-- TOC entry 4835 (class 2606 OID 16446)
-- Name: book book_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.author(author_id);


--
-- TOC entry 4838 (class 2606 OID 16475)
-- Name: book_category book_category_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_category
    ADD CONSTRAINT book_category_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(book_id);


--
-- TOC entry 4839 (class 2606 OID 16480)
-- Name: book_category book_category_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_category
    ADD CONSTRAINT book_category_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id);


--
-- TOC entry 4836 (class 2606 OID 16458)
-- Name: book_genre book_genre_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_genre
    ADD CONSTRAINT book_genre_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(book_id);


--
-- TOC entry 4837 (class 2606 OID 16463)
-- Name: book_genre book_genre_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_genre
    ADD CONSTRAINT book_genre_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genre(genre_id);


--
-- TOC entry 4841 (class 2606 OID 24840)
-- Name: book_image book_image_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.book_image
    ADD CONSTRAINT book_image_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(book_id) ON DELETE CASCADE NOT VALID;


--
-- TOC entry 4849 (class 2606 OID 49441)
-- Name: admin fk_admin_pickup; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT fk_admin_pickup FOREIGN KEY (pickup_point_id) REFERENCES public.pickup_point(pickup_point_id);


--
-- TOC entry 4843 (class 2606 OID 24905)
-- Name: cart_item fk_cart_item_book; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT fk_cart_item_book FOREIGN KEY (book_id) REFERENCES public.book(book_id);


--
-- TOC entry 4844 (class 2606 OID 24942)
-- Name: cart_item fk_cart_item_cart; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES public.cart(cart_id) ON DELETE CASCADE;


--
-- TOC entry 4842 (class 2606 OID 24932)
-- Name: cart fk_cart_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES public.client(client_id);


--
-- TOC entry 4847 (class 2606 OID 24925)
-- Name: order_item fk_order_item_book; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT fk_order_item_book FOREIGN KEY (book_id) REFERENCES public.book(book_id);


--
-- TOC entry 4848 (class 2606 OID 24920)
-- Name: order_item fk_order_item_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- TOC entry 4845 (class 2606 OID 24910)
-- Name: orders fk_order_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES public.client(client_id);


--
-- TOC entry 4846 (class 2606 OID 49436)
-- Name: orders fk_pickup_point; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_pickup_point FOREIGN KEY (pickup_point_id) REFERENCES public.pickup_point(pickup_point_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4840 (class 2606 OID 16576)
-- Name: review review_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.book(book_id);


-- Completed on 2026-02-19 18:20:29

--
-- PostgreSQL database dump complete
--

