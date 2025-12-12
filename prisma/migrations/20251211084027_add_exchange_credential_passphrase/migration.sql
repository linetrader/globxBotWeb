-- AlterTable
ALTER TABLE "ExchangeCredential" ADD COLUMN     "passphraseCipher" TEXT,
ADD COLUMN     "passphraseIv" TEXT,
ADD COLUMN     "passphraseTag" TEXT;
