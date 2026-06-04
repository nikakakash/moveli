namespace Moveli.Domain.Enums;

// Where a discount is surfaced as a curated "deal". None = a silent price cut only.
public enum DealPlacement
{
    None = 0,
    DealsPage = 1,
    FlashSale = 2,
    Featured = 3
}
