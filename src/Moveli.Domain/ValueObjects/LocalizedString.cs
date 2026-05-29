namespace Moveli.Domain.ValueObjects;

public class LocalizedString
{
    public string Ka { get; set; } = string.Empty;
    public string En { get; set; } = string.Empty;

    public LocalizedString() { }

    public LocalizedString(string ka, string en)
    {
        Ka = ka;
        En = en;
    }
}
