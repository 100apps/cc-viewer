# KV-Cache İçeriği

## KV-Cache Nedir?

KV-Cache (Key-Value Cache), büyük dil modellerinin çıkarım sürecinde temel hızlandırma mekanizmasıdır. Claude ile sohbet ettiğinizde, her istek tam konuşma geçmişini (system prompt + araç tanımları + geçmiş mesajlar) gönderir. Her seferinde her şey sıfırdan hesaplansaydı, bu çok zaman alıcı ve pahalı olurdu.

KV-Cache'in rolü: zaten hesaplanmış içeriği önbellekte depolamak, böylece bir sonraki istekte yeniden kullanılabilmesi ve tekrarlanan hesaplamaların atlanması.

## Önbellek Nasıl Çalışır

Anthropic'in prompt caching özelliği, önbellek anahtarlarını sabit bir sırayla birleştirir:

```
System Prompt → Tools → Messages (cache breakpoint'e kadar)
```

Bu önek önceki istekle tamamen aynı olduğu sürece, API önbelleği vurur (`cache_read_input_tokens` döndürür), gecikmeyi ve maliyetleri önemli ölçüde azaltır.

## "Mevcut KV-Cache İçeriği" Nedir?

cc-viewer'da gösterilen "Mevcut KV-Cache İçeriği", en son MainAgent isteğinden çıkarılan ve önbelleğe alınmış olarak işaretlenen içeriktir. Özellikle şunları içerir:

- **System Prompt**: Claude Code'un sistem talimatları, CLAUDE.md'niz, proje açıklaması, ortam bilgisi vb. dahil
- **Messages**: Konuşma geçmişinin önbelleğe alınan kısmı (genellikle daha eski mesajlar)
- **Tools**: Mevcut araç tanımlarının listesi (Read, Write, Bash, MCP araçları vb.)

Bu içerik, API isteğinin body'sinde `cache_control: { type: "ephemeral" }` aracılığıyla işaretlenerek önbellek sınırını gösterir.

## Neden Önbellek İçeriğini Görüntülemelisiniz?

1. **Bağlamı Anlama**: Claude'un şu anda "hatırladığı" içeriği bilin ve davranışın beklentilerinize uygun olup olmadığını değerlendirmenize yardımcı olun
2. **Maliyet Optimizasyonu**: Önbellek isabetleri yeniden hesaplamadan çok daha az maliyetlidir. Önbellek içeriğini görüntülemek, belirli isteklerin neden önbellek yeniden oluşturmayı (cache rebuild) tetiklediğini anlamanıza yardımcı olur
3. **Konuşma Hata Ayıklama**: Claude'un yanıtı beklentilerinize uymadığında, önbellek içeriğini kontrol ederek system prompt ve geçmiş mesajların doğru olduğunu doğrulayabilirsiniz
4. **Kullanıcı Talimatı Gezintisi**: Önbellek içeriğindeki kullanıcı mesajları listesi aracılığıyla, konuşmada herhangi bir konuma hızlıca atlayabilirsiniz
5. **Bağlam Kalitesi İzleme**: Günlük hata ayıklama, Claude Code yapılandırmasını değiştirme veya prompt ayarlama sırasında, KV-Cache-Text merkezi bir bakış açısı sağlar ve temel bağlamın bozulmadığını ya da beklenmedik içerikle kirlenmediğini hızlıca doğrulamanıza yardımcı olur — orijinal mesajları tek tek gözden geçirmeye gerek kalmadan

## Önbelleğin Yaşam Döngüsü

- **Oluşturma**: İlk istekte veya önbellek geçersizleşmesinin ardından, API yeni bir önbellek oluşturur (`cache_creation_input_tokens`)
- **İsabet**: Sonraki isteklerin öneki tutarlı olduğunda, önbellek yeniden kullanılır (`cache_read_input_tokens`)
- **Sona Erme**: Önbelleğin 5 dakikalık bir TTL'si (yaşam süresi) vardır ve bu sürenin ardından otomatik olarak sona erer
- **Yeniden Oluşturma**: System prompt, araç listesi, model veya mesajlar değiştiğinde, önbellek anahtarı eşleşmez ve yeniden oluşturma tetiklenir
