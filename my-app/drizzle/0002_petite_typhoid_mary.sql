ALTER TABLE "words" DROP CONSTRAINT "words_bookid_books_bookid_fk";
--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_bookid_books_bookid_fk" FOREIGN KEY ("bookid") REFERENCES "public"."books"("bookid") ON DELETE cascade ON UPDATE cascade;